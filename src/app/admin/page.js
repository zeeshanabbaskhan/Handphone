"use client"
import React, { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp,
    Package,
    Bell,
    Search,
    Menu,
    X,
    Calendar,
    ArrowUp,
    ArrowDown,
    Eye,
    Edit,
    MoreHorizontal,
    RefreshCw,
    Loader
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Adminsidebar from '@/components/Adminsidebar';
import { userauthstore } from '@/Store/UserAuthStore';
import axiosInstance from '@/Store/AxiosInstance';
import { toast } from 'react-hot-toast';
import ProtectedRoute from '@/components/Protectedroute';

const AdminDashboard = () => {
    const { opensidebar, setOpenSidebar } = userauthstore();
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Dashboard data state
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalRevenue: 0,
            totalOrders: 0,
            totalCustomers: 0,
            conversionRate: 0,
            changes: {
                revenue: 0,
                orders: 0,
                customers: 0,
                conversion: 0
            }
        },
        revenueData: [],
        recentOrders: [],
        topProducts: [],
        error: null
    });

    // Fetch dashboard data
    const fetchDashboardData = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            setRefreshing(!showLoader);

            const [statsRes, revenueRes, ordersRes, productsRes] = await Promise.all([
                axiosInstance.get(`/api/admin/dashboard/stats?period=${selectedPeriod}`),
                axiosInstance.get(`/api/admin/dashboard/revenue-chart?period=${selectedPeriod}`),
                axiosInstance.get('/api/admin/dashboard/recent-orders?limit=4'),
                axiosInstance.get('/api/admin/dashboard/top-products?limit=4')
            ]);

            setDashboardData({
                stats: statsRes.data.data,
                revenueData: revenueRes.data.data,
                recentOrders: ordersRes.data.data,
                topProducts: productsRes.data.data,
                error: null
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);

            let errorMessage = 'Failed to fetch dashboard data';
            if (error.response) {
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection.';
            }

            setDashboardData(prev => ({
                ...prev,
                error: errorMessage
            }));

            toast.error(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch data on component mount and period change
    useEffect(() => {
        fetchDashboardData();
    }, [selectedPeriod]);

    // Utility functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num?.toString() || '0';
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'delivered':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'processing':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'shipped':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getPeriodLabel = (period) => {
        switch (period) {
            case '7d': return 'Last 7 days';
            case '30d': return 'Last 30 days';
            case '90d': return 'Last 90 days';
            default: return 'Last 7 days';
        }
    };

    // Stats configuration
    const stats = [
        {
            title: 'Total Revenue',
            value: formatCurrency(dashboardData.stats.totalRevenue),
            change: `${dashboardData.stats.changes?.revenue >= 0 ? '+' : ''}${dashboardData.stats.changes?.revenue?.toFixed(1) || 0}%`,
            trend: dashboardData.stats.changes?.revenue >= 0 ? 'up' : 'down',
            icon: DollarSign,
            color: 'from-green-400 to-emerald-600'
        },
        {
            title: 'Orders',
            value: formatNumber(dashboardData.stats.totalOrders),
            change: `${dashboardData.stats.changes?.orders >= 0 ? '+' : ''}${dashboardData.stats.changes?.orders?.toFixed(1) || 0}%`,
            trend: dashboardData.stats.changes?.orders >= 0 ? 'up' : 'down',
            icon: ShoppingCart,
            color: 'from-blue-400 to-cyan-600'
        },
        {
            title: 'Customers',
            value: formatNumber(dashboardData.stats.totalCustomers),
            change: `${dashboardData.stats.changes?.customers >= 0 ? '+' : ''}${dashboardData.stats.changes?.customers?.toFixed(1) || 0}%`,
            trend: dashboardData.stats.changes?.customers >= 0 ? 'up' : 'down',
            icon: Users,
            color: 'from-purple-400 to-violet-600'
        },
        {
            title: 'Conversion Rate',
            value: `${dashboardData.stats.conversionRate?.toFixed(2) || 0}%`,
            change: `${dashboardData.stats.changes?.conversion >= 0 ? '+' : ''}${dashboardData.stats.changes?.conversion?.toFixed(1) || 0}%`,
            trend: dashboardData.stats.changes?.conversion >= 0 ? 'up' : 'down',
            icon: TrendingUp,
            color: 'from-orange-400 to-red-500'
        }
    ];

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800/90 backdrop-blur border border-slate-700/50 rounded-lg p-3 shadow-xl">
                    <p className="text-slate-300 text-sm mb-1">{label}</p>
                    {payload.map((item, index) => (
                        <p key={index} className="text-white font-medium" style={{ color: item.color }}>
                            {item.name}: {item.name.includes('Revenue') ? formatCurrency(item.value) : formatNumber(item.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">Loading dashboard...</p>
                    <p className="text-slate-400 text-sm mt-2">Fetching your business insights</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <Adminsidebar />

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Header */}
                <header className="bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setOpenSidebar(!opensidebar)}
                                className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                            >
                                <Menu className="w-5 h-5 text-slate-400" />
                            </button>
                            <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
                        </div>

                      
                    </div>
                </header>

                {/* Error Display */}
                {dashboardData.error && (
                    <div className="p-6">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-center">
                            <p>{dashboardData.error}</p>
                            <button
                                onClick={() => fetchDashboardData()}
                                className="mt-2 text-sm underline hover:no-underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* Dashboard Content */}
                <main className="p-6 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                        <div className="flex items-center mt-2">
                                            {stat.trend === 'up' ? (
                                                <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
                                            ) : (
                                                <ArrowDown className="w-4 h-4 text-red-400 mr-1" />
                                            )}
                                            <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                                {stat.change}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Chart */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                >
                                    <option value="7d">Last 7 days</option>
                                    <option value="30d">Last 30 days</option>
                                    <option value="90d">Last 90 days</option>
                                </select>
                            </div>
                            {dashboardData.revenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={dashboardData.revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="name" stroke="#9CA3AF" />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#8B5CF6"
                                            strokeWidth={3}
                                            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-slate-400">
                                    No revenue data available
                                </div>
                            )}
                        </div>

                        {/* Orders Chart */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-6">Orders Trend</h3>
                            {dashboardData.revenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={dashboardData.revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="name" stroke="#9CA3AF" />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <defs>
                                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                        <Bar dataKey="orders" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-slate-400">
                                    No orders data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders & Top Products */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Orders */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                                <button
                                    onClick={() => window.location.href = '/admin/orders'}
                                    className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="space-y-4">
                                {dashboardData.recentOrders.length > 0 ? (
                                    dashboardData.recentOrders.map((order) => (
                                        <div key={order._id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors group">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-white">#{order.orderNumber || order._id.slice(-6)}</p>
                                                    <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <p className="text-sm text-slate-400 mt-1">{order.user?.name || order.customerName}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="font-semibold text-green-400">{formatCurrency(order.totalAmount)}</span>
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-400">
                                        No recent orders
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">Top Products</h3>
                                <button
                                    onClick={() => window.location.href = '/admin/products'}
                                    className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="space-y-4">
                                {dashboardData.topProducts.length > 0 ? (
                                    dashboardData.topProducts.map((product) => (
                                        <div key={product._id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors group">
                                            <div className="flex items-center space-x-3">
                                                {product.images && product.images[0] && (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium text-white">{product.name}</p>
                                                        <div className="flex items-center space-x-2">
                                                            <ArrowUp className="w-4 h-4 text-green-400" />
                                                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600/50 rounded transition-all">
                                                                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-sm text-slate-400">{product.totalSales || 0} sales</span>
                                                        <span className="font-semibold text-green-400">{formatCurrency(product.totalRevenue || product.price)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-400">
                                        No products data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {opensidebar && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setOpenSidebar(false)}
                />
            )}
        </div>
        </ProtectedRoute>
    );
};

export default AdminDashboard;