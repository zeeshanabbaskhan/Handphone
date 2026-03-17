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
    Mail,
    Phone,
    MapPin,
    Star,
    Download,
    UserPlus,
    Activity,
    CreditCard,
    Package2,
    Heart,
    Gift,
    AlertCircle,
    CheckCircle,
    Clock,
    Ban,
    MessageSquare,
    ArrowUpRight,
    Trash2,
    Send,
    AlertTriangle,
    User
} from 'lucide-react';
import Adminsidebar from '@/components/Adminsidebar';
import { userauthstore } from '@/Store/UserAuthStore';
import ProtectedRoute from '@/components/Protectedroute';

const CustomerManagementPage    = () => {
    const { opensidebar, setOpenSidebar, getallcustomers, allcustomers } = userauthstore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSegment, setSelectedSegment] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [customerToEmail, setCustomerToEmail] = useState(null);
    const [emailData, setEmailData] = useState({ subject: '', message: '' });

   

    useEffect(() => {
        getallcustomers();
    }, []);

    // Use real customers data from store, fallback to empty array
    const customers = allcustomers || [];

    const segments = ['all', 'vip', 'loyal', 'regular', 'new'];
    const statuses = ['all', 'active', 'new', 'inactive'];

    // Calculate stats from real data
    const calculateStats = () => {
        const totalCustomers = customers.length;
        const vipCustomers = customers.filter(c => c.segment === 'vip').length;
        const activeThisMonth = customers.filter(c => c.status === 'active').length;
        const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
        const avgLifetimeValue = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

        return {
            totalCustomers,
            vipCustomers,
            activeThisMonth,
            avgLifetimeValue: avgLifetimeValue.toFixed(0),
            vipPercentage: totalCustomers > 0 ? ((vipCustomers / totalCustomers) * 100).toFixed(1) : 0,
            activeRate: totalCustomers > 0 ? ((activeThisMonth / totalCustomers) * 100).toFixed(1) : 0
        };
    };

    const stats = calculateStats();

    const getSegmentColor = (segment) => {
        switch (segment?.toLowerCase()) {
            case 'vip': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'loyal': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'regular': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'new': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'inactive': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return <CheckCircle className="w-4 h-4" />;
            case 'new': return <Star className="w-4 h-4" />;
            case 'inactive': return <Ban className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone?.includes(searchTerm);
        const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
        const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
        return matchesSearch && matchesSegment && matchesStatus;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleDeleteCustomer = (customer) => {
        setCustomerToDelete(customer);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        // Here you would call an API to delete the customer
        // For now, just show an alert
        alert(`Customer ${customerToDelete.name} would be deleted (implement API call)`);
        setShowDeleteModal(false);
        setCustomerToDelete(null);
    };

    const handleEmailCustomer = (customer) => {
        setCustomerToEmail(customer);
        setEmailData({ subject: '', message: '' });
        setShowEmailModal(true);
    };

    const sendEmail = () => {
        // Here you would call an API to send the email
        console.log('Sending email to:', customerToEmail.email);
        console.log('Subject:', emailData.subject);
        console.log('Message:', emailData.message);

        alert(`Email would be sent to ${customerToEmail.name} (implement API call)`);
        setShowEmailModal(false);
        setCustomerToEmail(null);
        setEmailData({ subject: '', message: '' });
    };

    const CustomerModal = ({ customer, onClose }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-2 border-purple-500/30">
                                {customer.profileImg ? (
                                    <img
                                        src={customer.profileImg}
                                        alt={customer.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-white" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{customer.name}</h2>
                                <p className="text-slate-400">{customer.email}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                    <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${getSegmentColor(customer.segment)}`}>
                                        {customer.segment?.toUpperCase() || 'NEW'}
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 ${getStatusColor(customer.status)}`}>
                                        {getStatusIcon(customer.status)}
                                        <span className="capitalize">{customer.status || 'new'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                           
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Customer Overview */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-slate-400 text-sm">Total Orders</p>
                                            <p className="text-2xl font-bold text-white">{customer.totalOrders || 0}</p>
                                        </div>
                                        <ShoppingCart className="w-8 h-8 text-blue-400" />
                                    </div>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-slate-400 text-sm">Total Spent</p>
                                            <p className="text-2xl font-bold text-green-400">${customer.totalSpent || 0}</p>
                                        </div>
                                        <DollarSign className="w-8 h-8 text-green-400" />
                                    </div>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-slate-400 text-sm">Avg Order</p>
                                            <p className="text-2xl font-bold text-purple-400">${customer.averageOrderValue || 0}</p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-purple-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="bg-slate-700/30 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-slate-400 text-sm">Customer ID</p>
                                        <p className="text-white">{customer._id || customer.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Join Date</p>
                                        <p className="text-white">{formatDate(customer.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Last Updated</p>
                                        <p className="text-white">{formatDate(customer.updatedAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Role</p>
                                        <p className="text-white capitalize">{customer.role || 'customer'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Details Sidebar */}
                        <div className="space-y-6">
                            {/* Contact Information */}
                            <div className="bg-slate-700/30 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2 text-slate-300">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{customer.email}</span>
                                    </div>
                                    {customer.phone && (
                                        <div className="flex items-center space-x-2 text-slate-300">
                                            <Phone className="w-4 h-4" />
                                            <span className="text-sm">{customer.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            {/* <div className="bg-slate-700/30 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleEmailCustomer(customer)}
                                        className="w-full bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg px-4 py-2 text-sm font-medium hover:bg-purple-500/30 transition-colors"
                                    >
                                        Send Email
                                    </button>
                                    <button className="w-full bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-500/30 transition-colors">
                                        Edit Customer
                                    </button>
                                    <button className="w-full bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-500/30 transition-colors">
                                        Update Status
                                    </button>
                                    <button className="w-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-500/30 transition-colors">
                                        View Orders
                                    </button>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            {/* Sidebar */}
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
                            <h2 className="text-2xl font-bold text-white">Customers Management</h2>
                        </div>

                       
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="p-6 bg-slate-800/20 backdrop-blur-xl border-b border-slate-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Total Customers</p>
                                    <p className="text-3xl font-bold text-white mt-2">{stats.totalCustomers}</p>
                                    <p className="text-purple-400 text-sm mt-1 flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        All registered users
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-500/20 rounded-xl">
                                    <Users className="w-8 h-8 text-purple-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">VIP Customers</p>
                                    <p className="text-3xl font-bold text-white mt-2">{stats.vipCustomers}</p>
                                    <p className="text-purple-400 text-sm mt-1 flex items-center">
                                        <Star className="w-4 h-4 mr-1" />
                                        {stats.vipPercentage}% of total
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-500/20 rounded-xl">
                                    <Star className="w-8 h-8 text-yellow-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Active Customers</p>
                                    <p className="text-3xl font-bold text-white mt-2">{stats.activeThisMonth}</p>
                                    <p className="text-green-400 text-sm mt-1 flex items-center">
                                        <Activity className="w-4 h-4 mr-1" />
                                        {stats.activeRate}% active rate
                                    </p>
                                </div>
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Avg Lifetime Value</p>
                                    <p className="text-3xl font-bold text-white mt-2">${stats.avgLifetimeValue}</p>
                                    <p className="text-blue-400 text-sm mt-1 flex items-center">
                                        <DollarSign className="w-4 h-4 mr-1" />
                                        Per customer
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <DollarSign className="w-8 h-8 text-blue-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="p-6 bg-slate-800/20 backdrop-blur-xl border-b border-slate-700/50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search customers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent w-full sm:w-64"
                                />
                            </div>

                            <select
                                value={selectedSegment}
                                onChange={(e) => setSelectedSegment(e.target.value)}
                                className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                            >
                                {segments.map(segment => (
                                    <option key={segment} value={segment}>
                                        {segment === 'all' ? 'All Segments' : segment.toUpperCase()}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>
                                        {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>

                
                        </div>
                    </div>
                </div>

                {/* Customers Table */}
                <main className="p-6">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Segment</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Join Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Orders</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Total Spent</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer._id || customer.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-2 border-slate-600/50">
                                                    {customer.profileImg ? (
                                                        <img
                                                            src={customer.profileImg}
                                                            alt={customer.name}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-6 h-6 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{customer.name}</p>
                                                    <p className="text-slate-400 text-sm">{customer.email}</p>
                                                    {customer.phone && (
                                                        <p className="text-slate-500 text-xs">{customer.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`px-3 py-1 rounded-lg text-xs font-medium border w-fit ${getSegmentColor(customer.segment)}`}>
                                                {customer.segment?.toUpperCase() || 'NEW'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {formatDate(customer.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-semibold">{customer.totalOrders || 0}</div>
                                            <div className="text-slate-400 text-sm">
                                                Updated: {formatDate(customer.updatedAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-green-400 font-semibold">${customer.totalSpent || 0}</div>
                                            <div className="text-slate-400 text-sm">
                                                Avg: ${customer.averageOrderValue || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusColor(customer.status)}`}>
                                                {getStatusIcon(customer.status)}
                                                <span className="capitalize">{customer.status || 'new'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCustomer(customer);
                                                        setShowCustomerModal(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                                    title="View Details"
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

                    {filteredCustomers.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-400 mb-2">No customers found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Customer Details Modal */}
            {showCustomerModal && selectedCustomer && (
                <CustomerModal
                    customer={selectedCustomer}
                    onClose={() => {
                        setShowCustomerModal(false);
                        setSelectedCustomer(null);
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && customerToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Delete Customer</h3>
                                <p className="text-slate-400 text-sm">This action cannot be undone</p>
                            </div>
                        </div>

                        <p className="text-slate-300 mb-6">
                            Are you sure you want to delete <span className="font-semibold text-white">{customerToDelete.name}</span>?
                            This will permanently remove all customer data and order history.
                        </p>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-4 py-2 text-sm font-medium hover:bg-red-500/30 transition-colors"
                            >
                                Delete Customer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Modal */}
            {showEmailModal && customerToEmail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEmailModal(false)} />
                    <div className="relative bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-2xl w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Mail className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Send Email</h3>
                                    <p className="text-slate-400 text-sm">To: {customerToEmail.name} ({customerToEmail.email})</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={emailData.subject}
                                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                                    placeholder="Enter email subject..."
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                                <textarea
                                    value={emailData.message}
                                    onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                                    placeholder="Type your message here..."
                                    rows={6}
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendEmail}
                                disabled={!emailData.subject.trim() || !emailData.message.trim()}
                                className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl px-4 py-2 text-sm font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                <Send className="w-4 h-4" />
                                <span>Send Email</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </ProtectedRoute>
    );
};

export default CustomerManagementPage;