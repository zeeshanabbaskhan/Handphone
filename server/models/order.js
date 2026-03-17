const mongoose = require('mongoose');
const user = require('./user'); // Assuming user model is in the same directory
const product = require('./product'); // Assuming product model is in the same directory

const orderSchema = new mongoose.Schema({
    // Auto-generated order number
    orderNumber: {
        type: String,
        unique: true,
        default: function () {
            return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
        }
    },

    // Customer Information
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Order Items
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative']
        },
        selectedOptions: {
            selectedColor: String,
            selectedMemory: String,
            selectedSize: String,
            // Add more options as needed
        }
    }],

    // Billing Information
    billingInfo: {
        name: {
            type: String,
            required: [true, 'Billing name is required'],
            trim: true,
            maxLength: [100, 'Name cannot exceed 100 characters']
        },
        email: {
            type: String,
            required: [true, 'Billing email is required'],
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true,
            maxLength: [200, 'Address cannot exceed 200 characters']
        },
        city: {
            type: String,
            trim: true,
            maxLength: [50, 'City name cannot exceed 50 characters']
        },
        state: {
            type: String,
            trim: true,
            maxLength: [50, 'State name cannot exceed 50 characters']
        },
        zipCode: {
            type: String,
            trim: true,
            maxLength: [20, 'ZIP code cannot exceed 20 characters']
        },
        country: {
            type: String,
            required: true,
            trim: true,
            default: 'Pakistan',
            maxLength: [50, 'Country name cannot exceed 50 characters']
        }
    },

    // Payment Information
    paymentMethod: {
        type: String,
        enum: {
            values: ['card', 'easypaisa', 'jazzcash', 'cod'],
            message: 'Payment method must be card, easypaisa, jazzcash, or cod'
        },
        required: true
    },

    paymentData: {
        transactionId: {
            type: String,
            index: true
        },
        status: {
            type: String,
            enum: ['pending', 'succeeded', 'failed', 'cancelled', 'refunded'],
            default: 'pending'
        },
        amount: Number,
        paymentMethod: String,
        paymentMethodId: String, // For Stripe payment method ID
        phoneNumber: String, // For mobile payments
        accountNumber: String, // For mobile payments
        timestamp: {
            type: Date,
            default: Date.now
        },
        // Additional Stripe specific fields
        receiptUrl: String,
        clientSecret: String
    },

    // Order Amounts
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative']
    },

    shippingCost: {
        type: Number,
        required: true,
        min: [0, 'Shipping cost cannot be negative'],
        default: 5
    },

    tax: {
        type: Number,
        min: [0, 'Tax cannot be negative'],
        default: 0
    },

    discount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        default: 0
    },

    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },

    // Order Status
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
            message: 'Invalid order status'
        },
        default: 'pending',
        index: true
    },

    // Shipping Information
    shippingInfo: {
        method: {
            type: String,
            enum: ['standard', 'express', 'overnight'],
            default: 'standard'
        },
        trackingNumber: {
            type: String,
            index: true
        },
        carrier: String,
        estimatedDelivery: Date,
        shippedAt: Date,
        deliveredAt: Date
    },

    // Order Notes
    customerNotes: {
        type: String,
        maxLength: [500, 'Customer notes cannot exceed 500 characters']
    },
    adminNotes: {
        type: String,
        maxLength: [500, 'Admin notes cannot exceed 500 characters']
    },

    // Order History/Timeline
    orderHistory: [{
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],

    // Cancellation/Refund Information
    cancellation: {
        reason: String,
        requestedAt: Date,
        processedAt: Date,
        refundAmount: Number,
        refundStatus: {
            type: String,
            enum: ['pending', 'processed', 'failed', 'cancelled']
        },
        refundTransactionId: String
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'paymentData.status': 1 });
orderSchema.index({ 'paymentData.transactionId': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingInfo.trackingNumber': 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });

// Compound indexes for complex queries
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ user: 1, createdAt: -1, status: 1 });

// Virtual for total items count
orderSchema.virtual('totalItems').get(function () {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for formatted order number
orderSchema.virtual('formattedOrderNumber').get(function () {
    return this.orderNumber || `ORD-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function () {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for payment status display
orderSchema.virtual('paymentStatusDisplay').get(function () {
    const status = this.paymentData?.status || 'pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
});

// Pre-save middleware to add order history entry
orderSchema.pre('save', function (next) {
    if (this.isNew) {
        this.orderHistory.push({
            status: this.status,
            note: 'Order created',
            timestamp: new Date()
        });
    } else if (this.isModified('status')) {
        // Only add to history if status actually changed
        const lastHistory = this.orderHistory[this.orderHistory.length - 1];
        if (!lastHistory || lastHistory.status !== this.status) {
            this.orderHistory.push({
                status: this.status,
                note: `Status changed to ${this.status}`,
                timestamp: new Date()
            });
        }
    }
    next();
});

// Pre-save middleware to validate total amount calculation
orderSchema.pre('save', function (next) {
    const calculatedTotal = this.subtotal + this.shippingCost + this.tax - this.discount;
    if (Math.abs(calculatedTotal - this.totalAmount) > 0.01) {
        return next(new Error('Total amount calculation mismatch'));
    }
    next();
});

// Static methods
orderSchema.statics.findByUser = function (userId, options = {}) {
    const query = this.find({ user: userId });

    if (options.status) {
        query.where('status').equals(options.status);
    }

    if (options.startDate && options.endDate) {
        query.where('createdAt').gte(options.startDate).lte(options.endDate);
    }

    return query.sort({ createdAt: -1 });
};

orderSchema.statics.findByStatus = function (status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

orderSchema.statics.findPendingPayments = function () {
    return this.find({ 'paymentData.status': 'pending' });
};

orderSchema.statics.getOrderStats = function (userId = null) {
    const matchStage = userId ? { $match: { user: new mongoose.Types.ObjectId(userId) } } : { $match: {} };

    return this.aggregate([
        matchStage,
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                averageOrderValue: { $avg: '$totalAmount' },
                totalItems: { $sum: { $sum: '$items.quantity' } }
            }
        }
    ]);
};

orderSchema.statics.getStatusSummary = function (userId = null) {
    const matchStage = userId ? { $match: { user: new mongoose.Types.ObjectId(userId) } } : { $match: {} };

    return this.aggregate([
        matchStage,
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$totalAmount' }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
};

// Instance methods
orderSchema.methods.updateStatus = function (newStatus, note, updatedBy) {
    this.status = newStatus;

    // Add specific logic for certain status changes
    if (newStatus === 'shipped') {
        this.shippingInfo.shippedAt = new Date();
    } else if (newStatus === 'delivered') {
        this.shippingInfo.deliveredAt = new Date();
    }

    this.orderHistory.push({
        status: newStatus,
        note: note || `Status updated to ${newStatus}`,
        timestamp: new Date(),
        updatedBy: updatedBy
    });

    return this.save();
};

orderSchema.methods.markAsPaid = function (transactionId, paymentProvider) {
    this.paymentData.status = 'succeeded';
    this.paymentData.transactionId = transactionId;
    this.paymentData.paymentProvider = paymentProvider;
    this.paymentData.timestamp = new Date();

    if (this.status === 'pending') {
        this.status = 'confirmed';
    }

    return this.save();
};

orderSchema.methods.processRefund = function (refundAmount, reason) {
    this.cancellation = {
        reason: reason || 'Refund requested',
        requestedAt: new Date(),
        refundAmount: refundAmount || this.totalAmount,
        refundStatus: 'pending'
    };

    if (this.status !== 'cancelled') {
        this.status = 'refunded';
    }

    return this.save();
};

orderSchema.methods.calculateTotal = function () {
    const itemsTotal = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    this.subtotal = itemsTotal;
    this.totalAmount = this.subtotal + this.shippingCost + this.tax - this.discount;

    return this.totalAmount;
};

orderSchema.methods.canBeCancelled = function () {
    const nonCancellableStatuses = ['shipped', 'delivered', 'cancelled', 'refunded'];
    return !nonCancellableStatuses.includes(this.status);
};

orderSchema.methods.canBeRefunded = function () {
    const refundableStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    return refundableStatuses.includes(this.status) && this.paymentData.status === 'succeeded';
};

orderSchema.methods.getTrackingInfo = function () {
    if (!this.shippingInfo.trackingNumber) {
        return null;
    }

    return {
        trackingNumber: this.shippingInfo.trackingNumber,
        carrier: this.shippingInfo.carrier,
        status: this.status,
        shippedAt: this.shippingInfo.shippedAt,
        estimatedDelivery: this.shippingInfo.estimatedDelivery,
        deliveredAt: this.shippingInfo.deliveredAt
    };
};

orderSchema.methods.generateInvoiceData = function () {
    return {
        orderNumber: this.orderNumber,
        orderDate: this.createdAt,
        customerInfo: this.billingInfo,
        items: this.items.map(item => ({
            name: item.product.name || 'Product',
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            options: item.selectedOptions
        })),
        pricing: {
            subtotal: this.subtotal,
            shipping: this.shippingCost,
            tax: this.tax,
            discount: this.discount,
            total: this.totalAmount
        },
        paymentInfo: {
            method: this.paymentMethod,
            status: this.paymentData.status,
            transactionId: this.paymentData.transactionId
        }
    };
};

// Error handling middleware
orderSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error('Order number already exists'));
    } else {
        next(error);
    }
});

// Pre-remove middleware to handle cleanup
orderSchema.pre('remove', function (next) {
    // Add any cleanup logic here if needed
    // For example, restore product stock if order is being deleted
    console.log(`Order ${this.orderNumber} is being removed`);
    next();
});

// Transform function to clean up sensitive data when converting to JSON
orderSchema.methods.toJSON = function () {
    const obj = this.toObject();

    // Remove sensitive payment data from client responses
    if (obj.paymentData) {
        delete obj.paymentData.clientSecret;
        delete obj.paymentData.paymentMethodId;
        // Keep only necessary payment info for client
        obj.paymentData = {
            status: obj.paymentData.status,
            transactionId: obj.paymentData.transactionId,
            paymentMethod: obj.paymentData.paymentMethod,
            timestamp: obj.paymentData.timestamp
        };
    }

    return obj;
};

// Text search index for order search functionality
orderSchema.index({
    orderNumber: 'text',
    'billingInfo.name': 'text',
    'billingInfo.email': 'text'
}, {
    weights: {
        orderNumber: 10,
        'billingInfo.name': 5,
        'billingInfo.email': 1
    }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;