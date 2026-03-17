"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Changed import
import { CheckCircle, Package, CreditCard, Truck, Clock } from 'lucide-react';
import axiosInstance from '@/Store/AxiosInstance';


import { Suspense } from "react";

function CheckoutSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const session_id = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (session_id) {
            handleSuccessfulPayment();
        }
    }, [session_id]);

    const handleSuccessfulPayment = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/api/stripe-success', { sessionId: session_id });
            console.log("Success response:", response.data);
            const result = response.data;
            setOrder(result.data.order);
            if (typeof window !== 'undefined' && window.clearCart) {
                window.clearCart();
            }
        } catch (err) {
            console.error('Success processing error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'text-green-600 bg-green-100';
            case 'processing':
                return 'text-blue-600 bg-blue-100';
            case 'shipped':
                return 'text-purple-600 bg-purple-100';
            case 'delivered':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Processing your order...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Processing Failed</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/orders')}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No order information found.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600">Thank you for your order. We'll send you a confirmation email shortly.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Summary Card */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-600">Order Number</p>
                                    <p className="font-semibold">{order.orderNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Order Date</p>
                                    <p className="font-semibold">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Payment Method</p>
                                    <p className="font-semibold flex items-center">
                                        <CreditCard className="w-4 h-4 mr-1" />
                                        Card Payment
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Amount</p>
                                    <p className="font-semibold text-lg">${order.totalAmount.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-semibold mb-4">Items Ordered</h3>
                                <div className="space-y-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                            <img
                                                src={item.product.images?.[0]?.url || '/placeholder-image.jpg'}
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.product.name}</h4>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                {item.selectedOptions && (
                                                    <div className="text-sm text-gray-500">
                                                        {item.selectedOptions.selectedColor && (
                                                            <span>Color: {item.selectedOptions.selectedColor} </span>
                                                        )}
                                                        {item.selectedOptions.selectedMemory && (
                                                            <span>Memory: {item.selectedOptions.selectedMemory}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                                <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Billing Information */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-medium">{order.billingInfo.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{order.billingInfo.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">{order.billingInfo.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Country</p>
                                    <p className="font-medium">{order.billingInfo.country}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600">Address</p>
                                    <p className="font-medium">
                                        {order.billingInfo.address}
                                        {order.billingInfo.city && `, ${order.billingInfo.city}`}
                                        {order.billingInfo.state && `, ${order.billingInfo.state}`}
                                        {order.billingInfo.zipCode && ` ${order.billingInfo.zipCode}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Status Timeline */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Order Status</h3>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Order Confirmed</p>
                                        <p className="text-sm text-gray-600">Payment received</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Processing</p>
                                        <p className="text-sm text-gray-600">Preparing your order</p>
                                    </div>
                                </div>
                                <div className="flex items-center opacity-50">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                        <Truck className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Shipped</p>
                                        <p className="text-sm text-gray-600">On the way to you</p>
                                    </div>
                                </div>
                                <div className="flex items-center opacity-50">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                        <CheckCircle className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Delivered</p>
                                        <p className="text-sm text-gray-600">Order completed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estimated Delivery */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Estimated Delivery</h3>
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                                <div>
                                    <p className="font-medium">3-5 Business Days</p>
                                    <p className="text-sm text-gray-600">Standard shipping</p>
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
    );
}

export default function CheckoutSuccess() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutSuccessContent />
        </Suspense>
    );
}