"use client"
import React, { useState, useEffect } from 'react';
import {
    Package,
    Users,
    DollarSign,
    TrendingUp,
    ShoppingCart,
    Search,
    Menu,
    X,
    Filter,
    Eye,
    Edit,
    MoreHorizontal,
    Calendar,
    Truck,
    CreditCard,
    MapPin,
    Phone,
    Mail,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Download,
    Printer,
    RefreshCw,
    ArrowUpRight,
    User,
    Package2,
    Save,
    Loader
} from 'lucide-react';
import Adminsidebar from '@/components/Adminsidebar';
import { userauthstore } from '@/Store/UserAuthStore';
import axiosInstance from '@/Store/AxiosInstance';
import ProtectedRoute from '@/components/Protectedroute';

const AdminOrdersPage = () => {
    const { opensidebar, setOpenSidebar } = userauthstore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedDateRange, setSelectedDateRange] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [editingStatus, setEditingStatus] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [customerInfo, setCustomerInfo] = useState({});
    const [updateLoading, setUpdateLoading] = useState(false);
    const [pagination, setPagination] = useState({});

    const statusOptions = ['all', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const dateRanges = ['all', 'today', 'week', 'month', 'quarter'];

    useEffect(() => {
        fetchOrders();
    }, [selectedStatus, selectedDateRange, searchTerm]);

    const fetchOrders = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (selectedStatus !== 'all') params.append('status', selectedStatus);
            if (selectedDateRange !== 'all') params.append('dateRange', selectedDateRange);
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', page);
            params.append('limit', 10);

            const response = await axiosInstance.get(`/api/admin/orders?${params}`);

            if (response.data.success) {
                setOrders(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await axiosInstance.get(`/api/admin/orders/${orderId}`);
            if (response.data.success) {
                const o = response.data.data;
                setSelectedOrder(o);
                setNewStatus(o.status);
                setCustomerInfo({
                    name: o.billingInfo.name,
                    email: o.billingInfo.email,
                    phone: o.billingInfo.phone,
                    address: o.billingInfo.address,
                    city: o.billingInfo.city,
                    state: o.billingInfo.state,
                    zipCode: o.billingInfo.zipCode,
                    country: o.billingInfo.country
                });
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            alert('Failed to fetch order details');
        }
    };

    const updateOrderStatus = async () => {
        try {
            setUpdateLoading(true);
            const response = await axiosInstance.patch(`/api/admin/orders/${selectedOrder._id}/status`, {
                status: newStatus
            });

            if (response.data.success) {
                setSelectedOrder(response.data.data);
                setEditingStatus(false);
                alert('Order status updated successfully');
                fetchOrders(); // Refresh the orders list
            }
        } catch (err) {
            console.error('Error updating order status:', err);
            alert(err.response?.data?.message || 'Failed to update order status');
        } finally {
            setUpdateLoading(false);
        }
    };

    const updateCustomerInfo = async () => {
        try {
            setUpdateLoading(true);
            const response = await axiosInstance.patch(`/api/admin/orders/${selectedOrder._id}/customer`, {
                billingInfo: customerInfo
            });

            if (response.data.success) {
                setSelectedOrder(response.data.data);
                setEditingCustomer(false);
                alert('Customer information updated successfully');
                fetchOrders(); // Refresh the orders list
            }
        } catch (err) {
            console.error('Error updating customer info:', err);
            alert(err.response?.data?.message || 'Failed to update customer information');
        } finally {
            setUpdateLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'shipped': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'confirmed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered': return <CheckCircle className="w-4 h-4" />;
            case 'shipped': return <Truck className="w-4 h-4" />;
            case 'processing': return <RefreshCw className="w-4 h-4" />;
            case 'confirmed': return <Clock className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.billingInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.billingInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const OrderModal = ({ order, onClose }) => {
        const statusFlow = ['confirmed', 'processing', 'shipped', 'delivered'];
        const currentIndex = statusFlow.indexOf(order.status);
        const canAdvance = currentIndex > -1 && currentIndex < statusFlow.length - 1 && order.status !== 'cancelled';

        const advanceStatus = async () => {
            if (!canAdvance) return;
            const next = statusFlow[currentIndex + 1];
            setNewStatus(next);
            setEditingStatus(true);
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl max-w-7xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-700/60 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Order #{order.orderNumber}</h2>
                            <p className="text-xs text-slate-400 mt-1">Created {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={advanceStatus}
                                disabled={!canAdvance}
                                className="px-3 py-2 text-xs rounded-lg font-medium bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                Advance Status
                            </button>
                            <button
                                onClick={() => setEditingStatus(!editingStatus)}
                                className="px-3 py-2 text-xs rounded-lg font-medium bg-slate-700/60 text-slate-200 hover:bg-slate-600/60 transition"
                            >
                                {editingStatus ? 'Close Status Editor' : 'Change Status'}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-slate-700/50 transition text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        <div className="grid xl:grid-cols-3 gap-6">
                            {/* Left (Items & Totals) */}
                            <div className="xl:col-span-2 space-y-6">
                                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Package2 className="w-5 h-5 text-purple-400" /> Items
                                    </h3>
                                    <div className="space-y-4">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-slate-700/40">
                                                <img
                                                    src={item.product?.images?.[0]?.url || '/placeholder-image.jpg'}
                                                    alt={item.product?.name}
                                                    className="w-20 h-20 rounded-lg object-cover"
                                                    onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-white">{item.product?.name}</p>
                                                    <p className="text-xs text-slate-400">SKU: {item.product?.sku}</p>
                                                    <p className="text-xs text-slate-400">Qty: {item?.quantity} @ ${item.price.toFixed(2)}</p>
                                                    {item.selectedOptions && Object.keys(item?.selectedOptions).length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {Object.entries(item.selectedOptions).map(([k, v]) => (
                                                                <span key={k} className="text-[10px] px-2 py-0.5 rounded bg-slate-600/40 text-slate-300">
                                                                    {k}: {v}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-slate-300">Line Total</div>
                                                    <div className="font-semibold text-green-400">${(item.price * item.quantity).toFixed(2)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 border-t border-slate-700/50 pt-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Subtotal</span>
                                            <span className="text-white">${order.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Shipping</span>
                                            <span className="text-white">${order.shippingCost.toFixed(2)}</span>
                                        </div>
                                        {order.tax > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Tax</span>
                                                <span className="text-white">${order.tax.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {order.discount > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Discount</span>
                                                <span className="text-green-400">-${order.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t border-slate-700/50">
                                            <span className="text-slate-200 font-medium">Total</span>
                                            <span className="text-xl font-bold text-green-400">${order.totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status History */}
                                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-purple-400" /> Status Timeline
                                    </h3>
                                    <div className="relative pl-4">
                                        <div className="absolute left-1 top-0 bottom-0 w-px bg-slate-700/70" />
                                        {(order.statusHistory || []).length === 0 && (
                                            <p className="text-xs text-slate-500">No status changes recorded.</p>
                                        )}
                                        {(order.statusHistory || []).slice().reverse().map((s, idx) => (
                                            <div key={idx} className="mb-4 relative">
                                                <div className="absolute -left-[14px] top-1.5 w-3 h-3 rounded-full bg-purple-500 shadow" />
                                                <div className="text-sm text-white capitalize">{s.status}</div>
                                                <div className="text-[10px] text-slate-400">
                                                    {formatDate(s.updatedAt || s.timestamp || new Date())}
                                                </div>
                                                {s.note && <div className="text-[11px] text-slate-500 mt-0.5">{s.note}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right (Overview & Actions) */}
                            <div className="space-y-6">
                                {/* Current Status / Update */}
                                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white">Status</h3>
                                    </div>
                                    {editingStatus ? (
                                        <div className="space-y-3">
                                            <select
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(e.target.value)}
                                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white"
                                            >
                                                <option value="confirmed">Confirmed</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={updateOrderStatus}
                                                    disabled={updateLoading}
                                                    className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg px-3 py-2 text-xs font-medium hover:bg-green-500/30 transition disabled:opacity-50"
                                                >
                                                    {updateLoading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
                                                </button>
                                                <button
                                                    onClick={() => { setEditingStatus(false); setNewStatus(order.status); }}
                                                    className="flex-1 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-600/50 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border inline-flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span className="capitalize">{order.status}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Customer / Billing */}
                                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white">Customer</h3>
                                        <button
                                            onClick={() => setEditingCustomer(!editingCustomer)}
                                            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {editingCustomer ? (
                                        <div className="space-y-3">
                                            {[
                                                { key: 'name', label: 'Name' },
                                                { key: 'email', label: 'Email', type: 'email' },
                                                { key: 'phone', label: 'Phone' }
                                            ].map(f => (
                                                <div key={f.key}>
                                                    <label className="text-[11px] uppercase tracking-wide text-slate-400">{f.label}</label>
                                                    <input
                                                        type={f.type || 'text'}
                                                        value={customerInfo[f.key] || ''}
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, [f.key]: e.target.value })}
                                                        className="mt-1 w-full bg-slate-700/40 border border-slate-600/50 rounded-lg px-3 py-2 text-xs text-white"
                                                    />
                                                </div>
                                            ))}
                                            <div>
                                                <label className="text-[11px] uppercase tracking-wide text-slate-400">Address</label>
                                                <textarea
                                                    rows={2}
                                                    value={customerInfo.address || ''}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                                    className="mt-1 w-full bg-slate-700/40 border border-slate-600/50 rounded-lg px-3 py-2 text-xs text-white resize-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['city', 'state', 'zipCode', 'country'].map(k => (
                                                    <input
                                                        key={k}
                                                        placeholder={k}
                                                        value={customerInfo[k] || ''}
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, [k]: e.target.value })}
                                                        className="bg-slate-700/40 border border-slate-600/50 rounded-lg px-3 py-2 text-xs text-white"
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={updateCustomerInfo}
                                                    disabled={updateLoading}
                                                    className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg px-3 py-2 text-xs font-medium hover:bg-blue-500/30 transition disabled:opacity-50"
                                                >
                                                    {updateLoading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
                                                </button>
                                                <button
                                                    onClick={() => setEditingCustomer(false)}
                                                    className="flex-1 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-600/50 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2 text-slate-300">
                                                <User className="w-4 h-4" />
                                                <span className="text-sm">{order.billingInfo.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-slate-300">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm">{order.billingInfo.email}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-slate-300">
                                                <Phone className="w-4 h-4" />
                                                <span className="text-sm">{order.billingInfo.phone}</span>
                                            </div>
                                            <div className="flex items-start space-x-2 text-slate-300">
                                                <MapPin className="w-4 h-4 mt-1" />
                                                <div className="text-sm">
                                                    <p>{order.billingInfo.address}</p>
                                                    <p>{order.billingInfo.city}, {order.billingInfo.state} {order.billingInfo.zipCode}</p>
                                                    <p>{order.billingInfo.country}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && orders.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
                    <p className="text-white">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <Adminsidebar />

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
                            <h2 className="text-2xl font-bold text-white">Orders Management</h2>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={fetchOrders}
                                className="flex items-center space-x-2 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="p-6 bg-slate-800/20 backdrop-blur-xl border-b border-slate-700/50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent w-full sm:w-64"
                                />
                            </div>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                            >
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>
                                        {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedDateRange}
                                onChange={(e) => setSelectedDateRange(e.target.value)}
                                className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                            >
                                {dateRanges.map(range => (
                                    <option key={range} value={range}>
                                        {range === 'all' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders Table / Cards */}
                <main className="p-6">
                    {error ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-center">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-700/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Order</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {filteredOrders.map((order) => (
                                            <tr key={order._id} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-white">{order.orderNumber}</p>
                                                        <p className="text-slate-400 text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-white">{order.billingInfo.name}</p>
                                                        <p className="text-slate-400 text-sm">{order.billingInfo.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusColor(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        <span className="capitalize">{order.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-green-400 font-semibold">${order.totalAmount.toFixed(2)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                fetchOrderDetails(order._id);
                                                                setShowOrderModal(true);
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                {filteredOrders.map((order) => (
                                    <div key={order._id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <ShoppingCart className="w-5 h-5 text-purple-400" />
                                                <span className="font-bold text-white">#{order.orderNumber}</span>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span className="capitalize">{order.status}</span>
                                            </div>
                                        </div>
                                        <div className="text-slate-300 text-sm mb-2">
                                            {formatDate(order.createdAt)}
                                        </div>
                                        <div className="mb-2">
                                            <span className="font-medium text-white">{order.billingInfo.name}</span>
                                            <span className="block text-xs text-slate-400">{order.billingInfo.email}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-green-400 font-semibold">${order.totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-xs text-slate-400">Items: {order.items.length}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-slate-700/40 rounded px-2 py-1">
                                                    <img
                                                        src={item.product?.images?.[0]?.url || '/placeholder-image.jpg'}
                                                        alt={item.product?.name}
                                                        className="w-8 h-8 rounded object-cover"
                                                        onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                                                    />
                                                    <span className="text-xs text-white">{item.product?.name}</span>
                                                    <span className="text-xs text-slate-400">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => {
                                                    fetchOrderDetails(order._id);
                                                    setShowOrderModal(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {filteredOrders.length === 0 && !loading && (
                                    <div className="text-center py-12">
                                        <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-slate-400 mb-2">No orders found</h3>
                                        <p className="text-slate-500">Try adjusting your search or filters</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </main>
            </div>

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <OrderModal
                    order={selectedOrder}
                    onClose={() => {
                        setShowOrderModal(false);
                        setSelectedOrder(null);
                        setEditingStatus(false);
                        setEditingCustomer(false);
                    }}
                />
            )}

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

export default AdminOrdersPage;