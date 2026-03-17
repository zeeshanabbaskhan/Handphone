// Backend Routes - 
// Add these to your routes/admin.js or similar file
const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Adjust path as needed
const Order = require('../models/order'); // Adjust path as needed
const Product = require('../models/product'); // Adjust path as needed

// Dashboard stats endpoint
router.get('/dashboard/stats', async (req, res) => {
    try {
        const { period = '7d' } = req.query;

        // Calculate date range
        const now = new Date();
        const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

        console.log('Fetching stats for period:', period);
        console.log('Date range:', startDate, 'to', now);

        // Get current period stats - Modified to not filter by role initially
        const [totalRevenue, totalOrders, allUsers] = await Promise.all([
            Order.aggregate([
                { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.countDocuments({ createdAt: { $gte: startDate } }),
            User.find({}) // Get all users first to check the data
        ]);

        console.log('All users found:', allUsers.length);
        console.log('Sample user:', allUsers[0]); // Check user structure

        // Count customers - try different approaches
        let totalCustomers;

        // First try with role field
        const usersWithRole = await User.countDocuments({
            createdAt: { $gte: startDate },
            role: 'user'
        });

        // If no users with role, count all users (excluding admins if possible)
        if (usersWithRole === 0) {
            // Try to exclude admin users by different criteria
            const usersExcludingAdmin = await User.countDocuments({
                createdAt: { $gte: startDate },
                $or: [
                    { role: { $ne: 'admin' } },
                    { role: { $exists: false } },
                    { email: { $not: /admin/i } } // Exclude emails with 'admin'
                ]
            });

            totalCustomers = usersExcludingAdmin;
        } else {
            totalCustomers = usersWithRole;
        }

        console.log('Total customers found:', totalCustomers);

        // Calculate previous period for comparison
        const prevStartDate = new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000));
        const [prevRevenue, prevOrders] = await Promise.all([
            Order.aggregate([
                { $match: { createdAt: { $gte: prevStartDate, $lt: startDate }, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.countDocuments({ createdAt: { $gte: prevStartDate, $lt: startDate } })
        ]);

        // Previous customers
        let prevCustomers;
        const prevUsersWithRole = await User.countDocuments({
            createdAt: { $gte: prevStartDate, $lt: startDate },
            role: 'user'
        });

        if (prevUsersWithRole === 0) {
            prevCustomers = await User.countDocuments({
                createdAt: { $gte: prevStartDate, $lt: startDate },
                $or: [
                    { role: { $ne: 'admin' } },
                    { role: { $exists: false } },
                    { email: { $not: /admin/i } }
                ]
            });
        } else {
            prevCustomers = prevUsersWithRole;
        }

        // Calculate changes
        const revenueChange = prevRevenue[0] ? ((totalRevenue[0]?.total || 0) - prevRevenue[0].total) / prevRevenue[0].total * 100 : 0;
        const ordersChange = prevOrders ? ((totalOrders - prevOrders) / prevOrders * 100) : 0;
        const customersChange = prevCustomers ? ((totalCustomers - prevCustomers) / prevCustomers * 100) : 0;

        const response = {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalOrders,
            totalCustomers,
            conversionRate: totalCustomers > 0 ? (totalOrders / totalCustomers * 100) : 0,
            changes: {
                revenue: revenueChange,
                orders: ordersChange,
                customers: customersChange,
                conversion: 0
            }
        };

        console.log('Response data:', response);

        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Revenue chart data
router.get('/dashboard/revenue-chart', async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;

        const revenueData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000) },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: revenueData.map(item => ({
                name: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: item.revenue,
                orders: item.orders
            }))
        });
    } catch (error) {
        console.error('Error fetching revenue chart:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Recent orders
router.get('/dashboard/recent-orders', async (req, res) => {
    try {
        const { limit = 4 } = req.query;

        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Top products
router.get('/dashboard/top-products', async (req, res) => {
    try {
        const { limit = 4 } = req.query;

        // First check if you have orders with items
        const sampleOrder = await Order.findOne().populate('items.product');
        console.log('Sample order structure:', sampleOrder);

        // Try different approaches based on your order structure
        let topProducts;

        if (sampleOrder && sampleOrder.items) {
            // If orders have items array
            topProducts = await Order.aggregate([
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.product',
                        totalSales: { $sum: '$items.quantity' },
                        totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: parseInt(limit) },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' }
            ]);
        } else {
            // Fallback: just get recent products
            topProducts = await Product.find()
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));

            topProducts = topProducts.map(product => ({
                _id: product._id,
                name: product.name,
                images: product.images,
                price: product.price,
                totalSales: 0,
                totalRevenue: 0,
                product: product
            }));
        }

        const formattedProducts = topProducts.map(item => ({
            _id: item.product?._id || item._id,
            name: item.product?.name || item.name,
            images: item.product?.images || item.images,
            price: item.product?.price || item.price,
            totalSales: item.totalSales || 0,
            totalRevenue: item.totalRevenue || 0
        }));

        res.json({
            success: true,
            data: formattedProducts
        });
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;