// Create a new model: server/models/Analytics.js
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true,
        enum: ['page_view', 'product_view', 'add_to_cart', 'checkout_start', 'purchase']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    sessionId: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    value: {
        type: Number,
        default: 0
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Analytics', analyticsSchema);

// Add tracking endpoint in analytics routes:
router.post('/track', async (req, res) => {
    try {
        const { event, sessionId, productId, value, metadata } = req.body;
        
        const analyticsEvent = new Analytics({
            event,
            sessionId,
            userId: req.user?.id || null,
            productId,
            value,
            metadata
        });
        
        await analyticsEvent.save();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Analytics tracking error:', error);
        res.status(500).json({ success: false });
    }
});