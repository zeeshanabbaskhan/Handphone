"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/Protectedroute';
import axiosInstance from '@/Store/AxiosInstance';
import { userauthstore } from '@/Store/UserAuthStore';
import { Eye, Package, CreditCard, Calendar, Search, Filter, ChevronRight } from 'lucide-react';

const OrdersPage = () => {
    const router = useRouter();
    const { user } = userauthstore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({});
    const [summary, setSummary] = useState({});

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user, filters]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    params.append(key, value);
                }
            });

            const response = await axiosInstance.get(`/api/my-orders?${params}`);

            if (response.data.success) {
                setOrders(response.data.data);
                setPagination(response.data.pagination);
                setSummary(response.data.summary);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchOrders();
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    if (loading && filters.page === 1) {
        return (
            <ProtectedRoute>
                <Header />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your orders...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Header />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                        <p className="text-gray-600">Track and manage your orders</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <Package className="w-8 h-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.totalOrders || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <CreditCard className="w-8 h-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Total Spent</p>
                                    <p className="text-2xl font-bold text-gray-900">${(summary.totalSpent || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <Calendar className="w-8 h-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Average Order</p>
                                    <p className="text-2xl font-bold text-gray-900">${(summary.averageOrderValue || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search by order number or name..."
                                        value={filters.search}
                                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </form>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="bg-white rounded-lg shadow-sm">
                        {error ? (
                            <div className="p-8 text-center">
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={fetchOrders}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="p-8 text-center">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                                <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                                <button
                                    onClick={() => router.push('/customers/products')}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Order</th>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Items</th>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Total</th>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{order.orderNumber}</p>
                                                            <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        ${order.totalAmount.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => router.push(`/customers/orders/${order._id}`)}
                                                            className="flex items-center text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <div key={order._id} className="p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        {order.items.length} item{order.items.length > 1 ? 's' : ''} • ${order.totalAmount.toFixed(2)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => router.push(`/customers/orders/${order._id}`)}
                                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                                >
                                                    View Details
                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
                                        <p className="text-sm text-gray-600">
                                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page === 1 || loading}
                                                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                                                {pagination.page}
                                            </span>
                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page === pagination.pages || loading}
                                                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default OrdersPage;