// routes/orders.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const { checkauth } = require('../middlewares/checkauth');

const normalizeBaseUrl = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.trim().replace(/\/+$/, '');
};

const getFrontendBaseUrl = (req) => {
    const requestOrigin = normalizeBaseUrl(req.get('origin'));
    if (requestOrigin) return requestOrigin;

    const configuredBaseUrl = normalizeBaseUrl(
        process.env.STRIPE_REDIRECT_BASE_URL || process.env.FRONTEND_URL || process.env.CLIENT_URL
    );

    if (configuredBaseUrl) return configuredBaseUrl;

    return 'http://localhost:3000';
};


// Add this route to your backend routes/orders.js file

// Create Stripe Checkout Session
router.post('/create-stripe-checkout', checkauth, async (req, res) => {
    try {
        const {
            items,
            subtotal,
            shippingCost,
            tax = 0,
            discount = 0,
            totalAmount,
        } = req.body;

        // Validate required fields
        if (!items || !items.length || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // STEP 1: Validate stock availability and prices
        const stockValidation = [];
        let calculatedSubtotal = 0;

        for (let item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                });
            }

            if (Math.abs(product.price - item.price) > 0.01) {
                return res.status(400).json({
                    success: false,
                    message: `Price mismatch for ${product.name}. Please refresh and try again.`
                });
            }

            calculatedSubtotal += product.price * item.quantity;
            stockValidation.push({
                product,
                requestedQuantity: item.quantity
            });
        }

        // Validate calculated totals
        const calculatedTotal = calculatedSubtotal + shippingCost + tax - discount;
        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            return res.status(400).json({
                success: false,
                message: 'Total amount calculation error. Please refresh and try again.'
            });
        }

        // STEP 2: Create line items for Stripe
        const line_items = stockValidation.map(validation => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: validation.product.name,
                    description: validation.product.description || '',
                    images: validation.product.images && validation.product.images.length > 0
                        ? [validation.product.images[0].url]
                        : [],
                    metadata: {
                        product_id: validation.product._id.toString()
                    }
                },
                unit_amount: Math.round(validation.product.price * 100), // Convert to cents
            },
            quantity: validation.requestedQuantity,
        }));

        // Add shipping as a line item if there's shipping cost
        if (shippingCost > 0) {
            line_items.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Shipping',
                        description: 'Standard shipping'
                    },
                    unit_amount: Math.round(shippingCost * 100),
                },
                quantity: 1,
            });
        }

        // STEP 3: Create order data for metadata
        const orderData = {
            user_id: req.user.id,
            items: items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price,

            })),

            subtotal: calculatedSubtotal,
            shippingCost,
            tax,
            discount,
            totalAmount: calculatedTotal,

        };
        const frontendBaseUrl = getFrontendBaseUrl(req);
        const successUrl = `${frontendBaseUrl}/customers/products/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${frontendBaseUrl}/customers/products/checkout/error?session_id={CHECKOUT_SESSION_ID}&error_message=Cancelled`;

        // STEP 4: Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            customer_email: req.user.email,


            metadata: {
                user_id: req.user.id,
                // Store minimal essential data only
                order_data: JSON.stringify(orderData)
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
        });

        res.status(200).json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url
            }
        });

    } catch (error) {
        console.error('Stripe Checkout session creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create checkout session',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Handle successful Stripe checkout
router.post('/stripe-success', checkauth, async (req, res) => {


    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        // Retrieve the checkout session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Checkout session not found'
            });
        }

        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment was not successful'
            });
        }

        // Check if order already exists
        const existingOrder = await Order.findOne({
            'paymentData.transactionId': session.payment_intent
        });

        if (existingOrder) {
            return res.status(200).json({
                success: true,
                message: 'Order already exists',
                data: { order: existingOrder }
            });
        }

        // Extract order data from session metadata
        let orderData;
        try {
            orderData = JSON.parse(session.metadata.order_data);
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order data in session'
            });
        }

        // Verify user matches
        if (orderData.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: User mismatch'
            });
        }

        // Re-validate stock (double-check since time has passed)
        const stockValidation = [];
        for (let item of orderData.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product no longer available: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                // In real scenario, you might want to issue a partial refund
                return res.status(400).json({
                    success: false,
                    message: `Stock changed for ${product.name}. Available: ${product.stock}, Ordered: ${item.quantity}. Please contact support.`
                });
            }

            stockValidation.push({
                product,
                requestedQuantity: item.quantity
            });
        }

        const getuser = await User.findById(req.user.id);

        // Create Order
        const order = new Order({
            user: req.user.id,
            items: orderData.items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price,
                selectedOptions: item.selectedOptions || {}
            })),
            billingInfo: {
                name: getuser?.name || '',
                email: getuser?.email || '',
                phone: getuser?.phone || '',
                address: getuser?.address?.location || '',
                city: getuser?.address?.city || '',
                state: getuser?.address?.state || '',
                zipCode: getuser?.address?.zipCode || '',
                country: getuser?.address?.country || 'Pakistan'
            },
            paymentMethod: 'card',
            paymentData: {
                transactionId: session.payment_intent,
                sessionId: session.id,
                status: 'succeeded',
                amount: session.amount_total / 100, // Convert from cents
                paymentMethod: 'stripe_checkout',
                timestamp: new Date()
            },
            subtotal: orderData.subtotal,
            shippingCost: orderData.shippingCost,
            tax: orderData.tax,
            discount: orderData.discount,
            totalAmount: orderData.totalAmount,
            customerNotes: orderData.customerNotes,
            status: 'confirmed'
        });

        await order.save();

        // Update product stock and sales
        const bulkProductUpdates = stockValidation.map(validation => ({
            updateOne: {
                filter: { _id: validation.product._id },
                update: {
                    $inc: {
                        stock: -validation.requestedQuantity,
                        sales: validation.requestedQuantity
                    }
                }
            }
        }));

        await Product.bulkWrite(bulkProductUpdates);

        // Update user statistics
        await User.findByIdAndUpdate(req.user.id, {
            $inc: {
                totalOrders: 1,
                totalSpent: orderData.totalAmount
            },
            $set: {
                lastOrderDate: new Date()
            }
        });

        // Populate order details for response
        await order.populate([
            {
                path: 'items.product',
                select: 'name images price sku description category'
            },
            {
                path: 'user',
                select: 'name email phone'
            }
        ]);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order: {
                    _id: order._id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    totalAmount: order.totalAmount,
                    items: order.items,
                    billingInfo: order.billingInfo,
                    paymentMethod: order.paymentMethod,
                    createdAt: order.createdAt
                },
                session: {
                    id: session.id,
                    payment_status: session.payment_status,
                    amount_total: session.amount_total / 100
                }
            }
        });

    } catch (error) {
        console.error('Stripe success handling error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process successful payment',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});


// Step 2: Confirm Payment and Create Order (Frontend Stripe Integration)
router.post('/confirm-payment', checkauth, async (req, res) => {
    try {
        const { paymentIntentId, billingInfo } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID is required'
            });
        }

        // STEP 1: Retrieve and verify payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent) {
            return res.status(404).json({
                success: false,
                message: 'Payment intent not found'
            });
        }

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                success: false,
                message: 'Payment has not been completed successfully'
            });
        }

        // Check if order already exists for this payment intent
        const existingOrder = await Order.findOne({
            'paymentData.transactionId': paymentIntentId
        });

        if (existingOrder) {
            return res.status(200).json({
                success: true,
                message: 'Order already exists',
                data: { order: existingOrder }
            });
        }

        // STEP 2: Extract order data from payment intent metadata
        let orderData;
        try {
            orderData = JSON.parse(paymentIntent.metadata.order_data);
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order data in payment intent'
            });
        }

        // Verify user matches
        if (orderData.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: User mismatch'
            });
        }

        // STEP 3: Re-validate stock (double-check since time has passed)
        const stockValidation = [];
        for (let item of orderData.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product no longer available: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                // Partial refund might be needed here in a real scenario
                return res.status(400).json({
                    success: false,
                    message: `Stock changed for ${product.name}. Available: ${product.stock}, Ordered: ${item.quantity}. Please contact support for refund.`
                });
            }

            stockValidation.push({
                product,
                requestedQuantity: item.quantity
            });
        }

        // STEP 4: Create Order
        const order = new Order({
            user: req.user.id,
            items: orderData.items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price,
                selectedOptions: item.selectedOptions || {}
            })),
            billingInfo: orderData.billingInfo,
            paymentMethod: 'card',
            paymentData: {
                transactionId: paymentIntent.id,
                status: 'succeeded',
                amount: paymentIntent.amount / 100,
                paymentMethod: 'stripe',
                timestamp: new Date()
            },
            subtotal: orderData.subtotal,
            shippingCost: orderData.shippingCost,
            tax: orderData.tax,
            discount: orderData.discount,
            totalAmount: orderData.totalAmount,
            customerNotes: orderData.customerNotes,
            status: 'confirmed'
        });

        await order.save();

        // STEP 5: Update product stock and sales
        const bulkProductUpdates = stockValidation.map(validation => ({
            updateOne: {
                filter: { _id: validation.product._id },
                update: {
                    $inc: {
                        stock: -validation.requestedQuantity,
                        sales: validation.requestedQuantity
                    }
                }
            }
        }));

        await Product.bulkWrite(bulkProductUpdates);

        // STEP 6: Update user statistics
        await User.findByIdAndUpdate(req.user.id, {
            $inc: {
                totalOrders: 1,
                totalSpent: orderData.totalAmount
            },
            $set: {
                lastOrderDate: new Date()
            }
        });

        // STEP 7: Populate order details for response
        await order.populate([
            {
                path: 'items.product',
                select: 'name images price sku description category'
            },
            {
                path: 'user',
                select: 'name email phone'
            }
        ]);

        // STEP 8: Clean up payment intent metadata (optional)
        try {
            await stripe.paymentIntents.update(paymentIntentId, {
                metadata: {
                    user_id: req.user.id,
                    order_id: order._id.toString(),
                    order_number: order.orderNumber,
                    processed: 'true'
                }
            });
        } catch (metadataError) {
            console.error('Failed to update payment intent metadata:', metadataError);
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order: {
                    _id: order._id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    totalAmount: order.totalAmount,
                    items: order.items,
                    billingInfo: order.billingInfo,
                    paymentMethod: order.paymentMethod,
                    createdAt: order.createdAt
                },
                payment: {
                    transactionId: paymentIntent.id,
                    status: 'succeeded',
                    amount: paymentIntent.amount / 100
                }
            }
        });

    } catch (error) {
        console.error('Payment confirmation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to confirm payment and create order',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Mobile Payment Route (for non-Stripe payments)
router.post('/create-with-mobile-payment', checkauth, async (req, res) => {
    try {
        const {
            items,
            billingInfo,
            paymentMethod,
            paymentData,
            subtotal,
            shippingCost,
            tax = 0,
            discount = 0,
            totalAmount,
            customerNotes = ''
        } = req.body;

        // Validate required fields
        if (!items || !items.length || !billingInfo || !paymentMethod || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (!paymentData.phoneNumber || !paymentData.accountNumber) {
            return res.status(400).json({
                success: false,
                message: 'Mobile payment information is incomplete'
            });
        }

        // STEP 1: Validate stock availability and prices
        const stockValidation = [];
        let calculatedSubtotal = 0;

        for (let item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                });
            }

            if (Math.abs(product.price - item.price) > 0.01) {
                return res.status(400).json({
                    success: false,
                    message: `Price mismatch for ${product.name}. Please refresh and try again.`
                });
            }

            calculatedSubtotal += product.price * item.quantity;
            stockValidation.push({
                product,
                requestedQuantity: item.quantity
            });
        }

        // Validate calculated totals
        const calculatedTotal = calculatedSubtotal + shippingCost + tax - discount;
        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            return res.status(400).json({
                success: false,
                message: 'Total amount calculation error. Please refresh and try again.'
            });
        }

        // STEP 2: Process mobile payment
        const paymentResult = await processMobilePayment({
            provider: paymentMethod,
            phoneNumber: paymentData.phoneNumber,
            accountNumber: paymentData.accountNumber,
            amount: totalAmount,
            customerName: billingInfo.name,
            customerEmail: billingInfo.email
        });

        if (!paymentResult.success) {
            return res.status(400).json({
                success: false,
                message: paymentResult.error || 'Mobile payment failed',
                error_code: paymentResult.errorCode || 'mobile_payment_failed'
            });
        }

        // STEP 3: Create Order
        const order = new Order({
            user: req.user.id,
            items: items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price,
                selectedOptions: item.selectedOptions || {}
            })),
            billingInfo: {
                name: billingInfo.name.trim(),
                email: billingInfo.email.trim().toLowerCase(),
                phone: billingInfo.phone.trim(),
                address: billingInfo.address.trim(),
                city: billingInfo.city?.trim() || '',
                state: billingInfo.state?.trim() || '',
                zipCode: billingInfo.zipCode?.trim() || '',
                country: billingInfo.country?.trim() || 'Pakistan'
            },
            paymentMethod,
            paymentData: paymentResult,
            subtotal: calculatedSubtotal,
            shippingCost,
            tax,
            discount,
            totalAmount: calculatedTotal,
            customerNotes: customerNotes.trim(),
            status: 'confirmed'
        });

        await order.save();

        // STEP 4: Update product stock and sales
        const bulkProductUpdates = stockValidation.map(validation => ({
            updateOne: {
                filter: { _id: validation.product._id },
                update: {
                    $inc: {
                        stock: -validation.requestedQuantity,
                        sales: validation.requestedQuantity
                    }
                }
            }
        }));

        await Product.bulkWrite(bulkProductUpdates);

        // STEP 5: Update user statistics
        await User.findByIdAndUpdate(req.user.id, {
            $inc: {
                totalOrders: 1,
                totalSpent: calculatedTotal
            },
            $set: {
                lastOrderDate: new Date()
            }
        });

        // STEP 6: Populate order details for response
        await order.populate([
            {
                path: 'items.product',
                select: 'name images price sku description category'
            },
            {
                path: 'user',
                select: 'name email phone'
            }
        ]);

        res.status(201).json({
            success: true,
            message: 'Order created and payment processed successfully',
            data: {
                order: {
                    _id: order._id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    totalAmount: order.totalAmount,
                    items: order.items,
                    billingInfo: order.billingInfo,
                    paymentMethod: order.paymentMethod,
                    createdAt: order.createdAt
                },
                payment: {
                    transactionId: paymentResult.transactionId,
                    status: paymentResult.status,
                    amount: paymentResult.amount
                }
            }
        });

    } catch (error) {
        console.error('Mobile payment order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process mobile payment and create order',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Enhanced mobile payment processing function
async function processMobilePayment({ provider, phoneNumber, accountNumber, amount, customerName, customerEmail }) {
    return new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
            // Enhanced validation
            if (!phoneNumber.match(/^(\+92|92|0)?[0-9]{10}$/)) {
                resolve({
                    success: false,
                    error: 'Invalid phone number format',
                    errorCode: 'INVALID_PHONE'
                });
                return;
            }

            if (accountNumber.length < 5) {
                resolve({
                    success: false,
                    error: 'Invalid account number',
                    errorCode: 'INVALID_ACCOUNT'
                });
                return;
            }

            // Mock success/failure based on phone number for testing
            const isSuccess = !phoneNumber.endsWith('0000'); // Fail if phone ends with 0000

            if (isSuccess) {
                resolve({
                    success: true,
                    transactionId: `${provider.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    status: 'succeeded',
                    amount: amount,
                    paymentMethod: provider,
                    phoneNumber: phoneNumber,
                    accountNumber: accountNumber,
                    timestamp: new Date()
                });
            } else {
                resolve({
                    success: false,
                    error: 'Payment declined by mobile provider',
                    errorCode: 'PAYMENT_DECLINED'
                });
            }
        }, 1500); // 1.5 second delay to simulate API call
    });
}

// Get user orders with enhanced filtering
router.get('/my-orders', checkauth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            startDate,
            endDate,
            search
        } = req.query;

        const query = { user: req.user.id };

        // Add filters
        if (status && status !== 'all') {
            query.status = status;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'billingInfo.name': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .populate([
                {
                    path: 'items.product',
                    select: 'name images price sku category'
                }
            ])
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        // Add summary statistics
        const summary = await Order.aggregate([
            { $match: { user: req.user.id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' }
                }
            }
        ]);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            summary: summary[0] || {
                totalOrders: 0,
                totalSpent: 0,
                averageOrderValue: 0
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
});

// Get specific order with detailed information
router.get('/:orderId', checkauth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.user.id
        }).populate([
            {
                path: 'items.product',
                select: 'name images price sku description category brand'
            },
            {
                path: 'user',
                select: 'name email phone'
            }
        ]);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order'
        });
    }
});

// Cancel order (only if not shipped)
router.patch('/:orderId/cancel', checkauth, async (req, res) => {
    try {
        const { reason = 'Customer requested cancellation' } = req.body;

        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        if (!order.canBeCancelled()) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order with status: ${order.status}`
            });
        }

        // Update order status
        order.status = 'cancelled';
        order.cancellation = {
            reason,
            requestedAt: new Date(),
            processedAt: new Date()
        };

        await order.save();

        // Restore product stock
        for (let item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: {
                    stock: item.quantity,
                    sales: -item.quantity
                }
            });
        }

        // Update user statistics
        await User.findByIdAndUpdate(req.user.id, {
            $inc: {
                totalOrders: -1,
                totalSpent: -order.totalAmount
            }
        });

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order'
        });
    }
});

// Stripe webhook endpoint for payment confirmations
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded via webhook:', paymentIntent.id);

            try {
                // Check if order already exists
                const existingOrder = await Order.findOne({
                    'paymentData.transactionId': paymentIntent.id
                });

                if (!existingOrder) {
                    console.log('Order not found for payment intent:', paymentIntent.id);
                    // Order should be created via the confirm-payment endpoint
                    // This webhook serves as a backup/confirmation
                }
            } catch (error) {
                console.error('Error processing payment_intent.succeeded webhook:', error);
            }
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed via webhook:', failedPayment.id);

            try {
                const order = await Order.findOne({
                    'paymentData.transactionId': failedPayment.id
                });

                if (order) {
                    order.status = 'cancelled';
                    order.paymentData.status = 'failed';
                    await order.save();

                    // Restore product stock
                    for (let item of order.items) {
                        await Product.findByIdAndUpdate(item.product, {
                            $inc: { stock: item.quantity }
                        });
                    }

                    console.log(`Order ${order.orderNumber} cancelled due to failed payment`);
                }
            } catch (error) {
                console.error('Error handling failed payment from webhook:', error);
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});


// Add these routes to your existing order.js file

// Admin: Get all orders with filtering and pagination
router.get('/admin/orders', checkauth, async (req, res) => {
    try {
        // Add admin role check if you have role-based authentication
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Access denied. Admin role required.'
        //     });
        // }

        const {
            page = 1,
            limit = 10,
            status,
            dateRange,
            search
        } = req.query;

        let query = {};

        // Status filter
        if (status && status !== 'all') {
            query.status = status;
        }

        // Date range filter
        if (dateRange && dateRange !== 'all') {
            const now = new Date();
            let startDate = new Date();

            switch (dateRange) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    startDate.setMonth(now.getMonth() - 3);
                    break;
            }

            if (dateRange !== 'all') {
                query.createdAt = { $gte: startDate };
            }
        }

        // Search filter
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'billingInfo.name': { $regex: search, $options: 'i' } },
                { 'billingInfo.email': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .populate([
                {
                    path: 'items.product',
                    select: 'name images price sku category'
                },
                {
                    path: 'user',
                    select: 'name email phone'
                }
            ])
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        // Calculate summary statistics
        const summary = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' }
                }
            }
        ]);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            summary: summary[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0
            }
        });

    } catch (error) {
        console.error('Admin get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
});

// Admin: Get specific order details
router.get('/admin/orders/:orderId', checkauth, async (req, res) => {
    try {
        // Add admin role check if needed
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Access denied. Admin role required.'
        //     });
        // }

        const order = await Order.findById(req.params.orderId)
            .populate([
                {
                    path: 'items.product',
                    select: 'name images price sku description category brand'
                },
                {
                    path: 'user',
                    select: 'name email phone address'
                }
            ]);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Admin get order details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order details'
        });
    }
});

// Admin: Update order status
router.patch('/admin/orders/:orderId/status', checkauth, async (req, res) => {
    try {
        // Add admin role check if needed
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Access denied. Admin role required.'
        //     });
        // }

        const { status } = req.body;
        const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const oldStatus = order.status;
        order.status = status;
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({
            status: status,
            updatedBy: req.user.id,
            updatedAt: new Date(),
            note: `Status changed from ${oldStatus} to ${status} by admin`
        });

        await order.save();

        // Populate the order before sending response
        await order.populate([
            {
                path: 'items.product',
                select: 'name images price sku description category'
            },
            {
                path: 'user',
                select: 'name email phone'
            }
        ]);

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });

    } catch (error) {
        console.error('Admin update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
});

// Admin: Update customer information
router.patch('/admin/orders/:orderId/customer', checkauth, async (req, res) => {
    try {
        // Add admin role check if needed
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Access denied. Admin role required.'
        //     });
        // }

        const { billingInfo } = req.body;

        if (!billingInfo) {
            return res.status(400).json({
                success: false,
                message: 'Billing information is required'
            });
        }

        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update billing info
        order.billingInfo = {
            name: billingInfo.name?.trim() || order.billingInfo.name,
            email: billingInfo.email?.trim().toLowerCase() || order.billingInfo.email,
            phone: billingInfo.phone?.trim() || order.billingInfo.phone,
            address: billingInfo.address?.trim() || order.billingInfo.address,
            city: billingInfo.city?.trim() || order.billingInfo.city,
            state: billingInfo.state?.trim() || order.billingInfo.state,
            zipCode: billingInfo.zipCode?.trim() || order.billingInfo.zipCode,
            country: billingInfo.country?.trim() || order.billingInfo.country
        };

        // Add to update history
        order.updateHistory = order.updateHistory || [];
        order.updateHistory.push({
            field: 'billingInfo',
            updatedBy: req.user.id,
            updatedAt: new Date(),
            note: 'Customer information updated by admin'
        });

        await order.save();

        // Populate the order before sending response
        await order.populate([
            {
                path: 'items.product',
                select: 'name images price sku description category'
            },
            {
                path: 'user',
                select: 'name email phone'
            }
        ]);

        res.json({
            success: true,
            message: 'Customer information updated successfully',
            data: order
        });

    } catch (error) {
        console.error('Admin update customer info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update customer information'
        });
    }
});

// Admin: Get order statistics/dashboard data
router.get('/admin/orders/stats/dashboard', checkauth, async (req, res) => {
    try {
        // Add admin role check if needed
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Access denied. Admin role required.'
        //     });
        // }

        const stats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' },
                    confirmedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    processingOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
                    },
                    shippedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
                    },
                    deliveredOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                    },
                    cancelledOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get monthly revenue data for charts
        const monthlyStats = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().getFullYear(), 0, 1) // Start of current year
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalOrders: 0,
                    totalRevenue: 0,
                    averageOrderValue: 0,
                    confirmedOrders: 0,
                    processingOrders: 0,
                    shippedOrders: 0,
                    deliveredOrders: 0,
                    cancelledOrders: 0
                },
                monthlyStats
            }
        });

    } catch (error) {
        console.error('Admin get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
});

module.exports = router; 