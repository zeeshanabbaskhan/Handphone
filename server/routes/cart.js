const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const { checkauth } = require('../middlewares/checkauth'); // Assuming you have auth middleware
const { log } = require('console');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/get-cart', checkauth, async (req, res) => {
    try {
        let cart = await Cart.findByUser(req.user.id);

        if (!cart) {
            cart = await Cart.createForUser(req.user.id);
        }

        res.json({
            success: true,
            cart
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cart',
            error: error.message
        });
    }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', checkauth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate product exists and is available
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock available'
            });
        }


        // Find or create cart
        let cart = await Cart.findByUser(req.user.id);
        if (!cart) {
            cart = await Cart.createForUser(req.user.id);
        }

        // Add item to cart
        await cart.addItem(product, quantity);

        // Populate product details for response
        await cart.populate('items.product');
        console.log('Cart after adding item:', cart);

        res.json({
            success: true,
            message: 'Item added to cart successfully',
            cart
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
});

// @route   PUT /api/cart/update/:itemId
// @desc    Update item quantity in cart
// @access  Private


// @route   DELETE /api/cart/remove/:itemId
// @desc    Remove item from cart
// @access  Private

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', checkauth, async (req, res) => {
    try {
        const cart = await Cart.findByUser(req.user.id);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        await cart.clearCart();

        res.json({
            success: true,
            message: 'Cart cleared successfully',
            cart
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
});

// @route   GET /api/cart/count
// @desc    Get cart items count
// @access  Private
router.get('/count', checkauth, async (req, res) => {
    try {
        const cart = await Cart.findByUser(req.user.id);
        const count = cart ? cart.totalQuantity : 0;

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Get cart count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cart count',
            error: error.message
        });
    }
});

router.delete('/remove/:itemId', checkauth, async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findByUser(req.user.id);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        await cart.removeItem(itemId);
        await cart.populate('items.product');

        res.json({
            success: true,
            message: 'Item removed from cart successfully',
            cart
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
});

router.put('/update/:itemId', checkauth, async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quantity'
            });
        }

        const cart = await Cart.findByUser(req.user.id);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Find the item to check stock
        const cartItem = cart.items.find(item => item._id.toString() === itemId);
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Check product stock
        const product = await Product.findById(cartItem.product);
        if (product && product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`
            });
        }

        await cart.updateItemQuantity(itemId, quantity);
        await cart.populate('items.product');

        res.json({
            success: true,
            message: 'Cart updated successfully',
            cart
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart',
            error: error.message
        });
    }
});


module.exports = router;