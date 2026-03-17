const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const { checkauth } = require('../middlewares/checkauth');

// Helper function to get date range
const getDateRange = (timeRange) => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
        case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
        case '6m':
            startDate.setMonth(now.getMonth() - 6);
            break;
        case '1y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate.setDate(now.getDate() - 30);
    }

    return { startDate, endDate: now };
};

// Get dashboard overview metrics
router.get('/dashboard', checkauth, async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        const { startDate, endDate } = getDateRange(timeRange);

        // Current period metrics
        const currentMetrics = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalAmount' }
                }
            }
        ]);

        // Previous period for comparison
        const prevStartDate = new Date(startDate);
        const prevEndDate = new Date(startDate);
        const timeDiff = endDate - startDate;
        prevStartDate.setTime(prevStartDate.getTime() - timeDiff);

        const previousMetrics = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: prevStartDate, $lte: prevEndDate },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalAmount' }
                }
            }
        ]);

        // Calculate conversion rate (you'll need to track page views separately)
        const totalVisitors = await getTotalVisitors(startDate, endDate); // Implement this
        const conversionRate = currentMetrics[0] ? (currentMetrics[0].totalOrders / totalVisitors) * 100 : 0;

        const current = currentMetrics[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
        const previous = previousMetrics[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

        // Calculate percentage changes
        const revenueChange = previous.totalRevenue > 0
            ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100
            : 0;
        const ordersChange = previous.totalOrders > 0
            ? ((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100
            : 0;
        const avgOrderChange = previous.avgOrderValue > 0
            ? ((current.avgOrderValue - previous.avgOrderValue) / previous.avgOrderValue) * 100
            : 0;

        res.json({
            success: true,
            data: {
                totalRevenue: current.totalRevenue,
                totalOrders: current.totalOrders,
                avgOrderValue: current.avgOrderValue,
                conversionRate,
                changes: {
                    revenue: revenueChange,
                    orders: ordersChange,
                    avgOrder: avgOrderChange,
                    conversion: 0 // Calculate based on your visitor tracking
                }
            }
        });

    } catch (error) {
        console.error('Analytics dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard metrics'
        });
    }
});

// Get revenue trends data
router.get('/revenue-trends', checkauth, async (req, res) => {
    try {
        const { timeRange = '30d', metric = 'revenue' } = req.query;
        const { startDate, endDate } = getDateRange(timeRange);

        let groupBy = {};
        let dateFormat = '';

        // Determine grouping based on time range
        if (timeRange === '7d' || timeRange === '30d') {
            // Group by day
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
            dateFormat = '%Y-%m-%d';
        } else if (timeRange === '90d' || timeRange === '6m') {
            // Group by week
            groupBy = {
                year: { $year: '$createdAt' },
                week: { $week: '$createdAt' }
            };
        } else {
            // Group by month
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };
        }

        const trendData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                    customers: { $addToSet: '$user' }
                }
            },
            {
                $addFields: {
                    customers: { $size: '$customers' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
            }
        ]);

        // Format the data for frontend
        const formattedData = trendData.map(item => {
            let name = '';
            if (item._id.day) {
                name = `${item._id.month}/${item._id.day}`;
            } else if (item._id.week) {
                name = `Week ${item._id.week}`;
            } else {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                name = monthNames[item._id.month - 1];
            }

            return {
                name,
                revenue: item.revenue,
                orders: item.orders,
                customers: item.customers
            };
        });

        res.json({
            success: true,
            data: formattedData
        });

    } catch (error) {
        console.error('Revenue trends error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue trends'
        });
    }
});

// Get top performing products
router.get('/top-products', checkauth, async (req, res) => {
    try {
        const { timeRange = '30d', limit = 5 } = req.query;
        const { startDate, endDate } = getDateRange(timeRange);

        const topProducts = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $ne: 'cancelled' }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    sales: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    name: '$product.name',
                    sales: 1,
                    revenue: 1,
                    image: { $arrayElemAt: ['$product.images.url', 0] }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: parseInt(limit) }
        ]);

        // Calculate trends (compare with previous period)
        const productsWithTrends = await Promise.all(
            topProducts.map(async (product) => {
                // Get previous period data for trend calculation
                const prevStartDate = new Date(startDate);
                const prevEndDate = new Date(startDate);
                const timeDiff = endDate - startDate;
                prevStartDate.setTime(prevStartDate.getTime() - timeDiff);

                const prevData = await Order.aggregate([
                    {
                        $match: {
                            createdAt: { $gte: prevStartDate, $lte: prevEndDate },
                            status: { $ne: 'cancelled' },
                            'items.product': product._id
                        }
                    },
                    { $unwind: '$items' },
                    {
                        $match: { 'items.product': product._id }
                    },
                    {
                        $group: {
                            _id: null,
                            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                        }
                    }
                ]);

                const prevRevenue = prevData[0]?.revenue || 0;
                const change = prevRevenue > 0
                    ? ((product.revenue - prevRevenue) / prevRevenue) * 100
                    : 0;

                return {
                    id: product._id,
                    name: product.name,
                    sales: product.sales,
                    revenue: product.revenue,
                    image: product.image,
                    trend: change >= 0 ? 'up' : 'down',
                    change: Math.abs(change).toFixed(1)
                };
            })
        );

        res.json({
            success: true,
            data: productsWithTrends
        });

    } catch (error) {
        console.error('Top products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top products'
        });
    }
});

// Get category performance
router.get('/categories', checkauth, async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        const { startDate, endDate } = getDateRange(timeRange);

        const categoryData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $ne: 'cancelled' }
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.category',
                    sales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    quantity: { $sum: '$items.quantity' }
                }
            },
            { $sort: { sales: -1 } }
        ]);

        const totalSales = categoryData.reduce((sum, cat) => sum + cat.sales, 0);

        const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5A3C', '#EC4899'];

        const formattedData = categoryData.map((category, index) => ({
            name: category._id || 'Uncategorized',
            value: Math.round((category.sales / totalSales) * 100),
            sales: category.sales,
            color: colors[index % colors.length]
        }));

        res.json({
            success: true,
            data: formattedData
        });

    } catch (error) {
        console.error('Categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category data'
        });
    }
});

// Get customer analytics
router.get('/customers', checkauth, async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        const { startDate, endDate } = getDateRange(timeRange);

        // New vs returning customers
        const customerData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$user',
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    firstOrder: { $min: '$createdAt' }
                }
            },
            {
                $addFields: {
                    isNewCustomer: {
                        $gte: ['$firstOrder', startDate]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    newCustomers: {
                        $sum: { $cond: ['$isNewCustomer', 1, 0] }
                    },
                    returningCustomers: {
                        $sum: { $cond: ['$isNewCustomer', 0, 1] }
                    },
                    totalCustomers: { $sum: 1 },
                    avgCustomerValue: { $avg: '$totalSpent' }
                }
            }
        ]);

        const result = customerData[0] || {
            newCustomers: 0,
            returningCustomers: 0,
            totalCustomers: 0,
            avgCustomerValue: 0
        };

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Customer analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer analytics'
        });
    }
});

// Helper function to get visitor data (implement based on your tracking)
async function getTotalVisitors(startDate, endDate) {
    // If you're using Google Analytics or similar, fetch data here
    // For now, return a mock value or implement your own visitor tracking
    return 10000; // Replace with actual implementation
}


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
module.exports = router;