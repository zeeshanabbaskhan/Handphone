"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/Protectedroute';
import axiosInstance from '@/Store/AxiosInstance';
import { userauthstore } from '@/Store/UserAuthStore';
import {
    ArrowLeft,
    Package,
    CreditCard,
    MapPin,
    Calendar,
    CheckCircle,
    Clock,
    Truck,
    X,
    Phone,
    Mail,
    User
} from 'lucide-react';

const OrderDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { user } = userauthstore();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        if (user && params.orderId) {
            fetchOrderDetail();
        }
    }, [user, params.orderId]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/${params.orderId}`);

            if (response.data.success) {
                setOrder(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching order detail:', err);
            setError('Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        try {
            setCancelLoading(true);
            const response = await axiosInstance.patch(`/api/${params.orderId}/cancel`, {
                reason: 'Customer requested cancellation'
            });

            if (response.data.success) {
                setOrder(response.data.data);
                alert('Order cancelled successfully');
            }
        } catch (err) {
            console.error('Error cancelling order:', err);
            alert(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'text-green-600 bg-green-100 border-green-200';
            case 'processing':
                return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'shipped':
                return 'text-purple-600 bg-purple-100 border-purple-200';
            case 'delivered':
                return 'text-green-600 bg-green-100 border-green-200';
            case 'cancelled':
                return 'text-red-600 bg-red-100 border-red-200';
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getStatusSteps = () => {
        const steps = [
            { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
            { id: 'processing', label: 'Processing', icon: Package },
            { id: 'shipped', label: 'Shipped', icon: Truck },
            { id: 'delivered', label: 'Delivered', icon: CheckCircle }
        ];

        const statusOrder = ['confirmed', 'processing', 'shipped', 'delivered'];
        const currentIndex = statusOrder.indexOf(order?.status);

        return steps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            active: index === currentIndex,
            cancelled: order?.status === 'cancelled'
        }));
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <Header />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading order details...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !order) {
        return (
            <ProtectedRoute>
                <Header />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                        <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
                        <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/customers/orders')}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                            >
                                View All Orders
                            </button>
                            <button
                                onClick={() => router.push('/customers/products')}
                                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const statusSteps = getStatusSteps();

    return (
        <ProtectedRoute>
            <Header />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/customers/orders')}
                        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Orders
                    </button>

                    {/* Order Header */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Order {order.orderNumber}
                                </h1>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    <div className="flex items-center">
                                        <CreditCard className="w-4 h-4 mr-1" />
                                        {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)} Payment
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center gap-4">
                                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                {order.status === 'confirmed' && (
                                    <button
                                        onClick={handleCancelOrder}
                                        disabled={cancelLoading}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                                    >
                                        {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Status Timeline */}
                            {order.status !== 'cancelled' && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
                                    <div className="space-y-4">
                                        {statusSteps.map((step, index) => {
                                            const Icon = step.icon;
                                            return (
                                                <div key={step.id} className="flex items-center">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${step.completed
                                                        ? 'bg-green-100 text-green-600'
                                                        : step.active
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : 'bg-gray-100 text-gray-400'
                                                        }`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`font-medium ${step.completed || step.active
                                                            ? 'text-gray-900'
                                                            : 'text-gray-400'
                                                            }`}>
                                                            {step.label}
                                                        </p>
                                                        {step.active && (
                                                            <p className="text-sm text-blue-600">Current status</p>
                                                        )}
                                                    </div>
                                                    {index < statusSteps.length - 1 && (
                                                        <div className={`w-px h-8 ml-5 ${step.completed ? 'bg-green-200' : 'bg-gray-200'
                                                            }`} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Order Items */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h2>
                                <div className="space-y-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                            <img
                                                src={item.product.images?.[0]?.url || '/placeholder-image.jpg'}
                                                alt={item.product.name}
                                                className="w-20 h-20 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                                                <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {Object.entries(item.selectedOptions).map(([key, value]) => (
                                                            <span key={key} className="mr-2">
                                                                {key}: {value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                                <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Billing Information */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <User className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-600">Name</p>
                                                <p className="font-medium text-gray-900">{order.billingInfo.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-600">Email</p>
                                                <p className="font-medium text-gray-900">{order.billingInfo.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-600">Phone</p>
                                                <p className="font-medium text-gray-900">{order.billingInfo.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-start">
                                            <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-600">Address</p>
                                                <div className="font-medium text-gray-900">
                                                    <p>{order.billingInfo.address}</p>
                                                    {order.billingInfo.city && <p>{order.billingInfo.city}</p>}
                                                    {order.billingInfo.state && <p>{order.billingInfo.state}</p>}
                                                    {order.billingInfo.zipCode && <p>{order.billingInfo.zipCode}</p>}
                                                    <p>{order.billingInfo.country}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>${order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span>${order.shippingCost.toFixed(2)}</span>
                                    </div>
                                    {order.tax > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tax</span>
                                            <span>${order.tax.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>-${order.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <hr />
                                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                                        <span>Total</span>
                                        <span>${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Method</p>
                                        <p className="font-medium text-gray-900">
                                            {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Transaction ID</p>
                                        <p className="font-medium text-gray-900 text-sm break-all">
                                            {order.paymentData.transactionId}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Status</p>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {order.paymentData.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/customers/orders')}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    View All Orders
                                </button>
                                <button
                                    onClick={() => router.push('/customers/products')}
                                    className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default OrderDetailPage;