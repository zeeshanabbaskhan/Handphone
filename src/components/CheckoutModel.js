import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, DollarSign } from 'lucide-react';
import { userauthstore } from '@/Store/UserAuthStore';
import axiosInstance from '@/Store/AxiosInstance';
import Link from 'next/link'; // <-- added
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (put your publishable key here)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here');

const CheckoutModal = ({
    isOpen,
    onClose,
    orderItems = [],
    onOrderSuccess,
    isFromCart = false
}) => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [orderTotal, setOrderTotal] = useState(0);
    const [shippingCost] = useState(5);
    const { user } = userauthstore();
    const [showAddressModal, setShowAddressModal] = useState(false); // <-- added

    // Address completeness check (adjust required fields as needed)
    const isAddressComplete = !!(
        user?.phone &&
        user?.address?.location &&
        user?.address?.city &&
        user?.address?.state &&
        user?.address?.zipCode &&
        user?.address?.country
    );

    // Auto-open modal if checkout opened without address
    useEffect(() => {
        if (isOpen && !isAddressComplete) {
            setShowAddressModal(true);
        } else {
            setShowAddressModal(false);
        }
    }, [isOpen, isAddressComplete]);

    // Calculate totals
    useEffect(() => {
        const subtotal = orderItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        setOrderTotal(subtotal + shippingCost);
    }, [orderItems, shippingCost]);

    const handleInputChange = (field, value) => {
        setMobilePayment(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        // Validate mobile payment specific fields
        if (selectedPaymentMethod === 'easypaisa' || selectedPaymentMethod === 'jazzcash') {
            if (!mobilePayment.phoneNumber || !mobilePayment.accountNumber) {
                alert('Please fill in mobile payment information');
                return false;
            }
        }

        return true;
    };

    const createStripeCheckoutSession = async () => {
        if (!isAddressComplete) throw new Error('Shipping address required.');
        try {
            const subtotal = orderTotal - shippingCost;

            const orderData = {
                items: orderItems.map(item => ({
                    product: item._id || item.product,
                    quantity: item.quantity,
                    price: item.price,
                    selectedOptions: item.selectedOptions || {}
                })),

                paymentMethod: selectedPaymentMethod,
                subtotal,
                shippingCost,
                tax: 0,
                discount: 0,
                totalAmount: orderTotal,
                customerNotes: ''
            };

            const response = await axiosInstance.post('/api/create-stripe-checkout', orderData)

            console.log('Stripe checkout session response:', response.data);

            // Fix: Check for 'success' instead of 'ok'
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to create checkout session');
            }

            return response.data.data;
        } catch (error) {
            console.error('Stripe checkout session creation error:', error);
            throw error;
        }
    };

    const processStripePayment = async () => {
        if (!isAddressComplete) throw new Error('Shipping address required.');
        const stripe = await stripePromise;
        if (!stripe) {
            throw new Error('Stripe not loaded properly');
        }

        // Create checkout session
        const { sessionId } = await createStripeCheckoutSession();

        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
            sessionId: sessionId
        });

        if (error) {
            throw new Error(error.message);
        }
    };

    const processMobilePayment = async () => {
        if (!isAddressComplete) throw new Error('Shipping address required.');
        try {
            const subtotal = orderTotal - shippingCost;

            const orderData = {
                items: orderItems.map(item => ({
                    product: item._id || item.product,
                    quantity: item.quantity,
                    price: item.price,
                    selectedOptions: item.selectedOptions || {}
                })),
                billingInfo: {
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    address: user?.address?.location || '',
                    city: user?.address?.city || '',
                    state: user?.address?.state || '',
                    zipCode: user?.address?.zipCode || '',
                    country: user?.address?.country || 'Pakistan'
                },
                paymentMethod: selectedPaymentMethod,
                paymentData: {
                    phoneNumber: mobilePayment.phoneNumber,
                    accountNumber: mobilePayment.accountNumber
                },
                subtotal,
                shippingCost,
                tax: 0,
                discount: 0,
                totalAmount: orderTotal,
                customerNotes: ''
            };

            const token = localStorage.getItem('token');
            const response = await fetch('/api/orders/create-with-mobile-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Mobile payment failed');
            }

            return result.data;
        } catch (error) {
            console.error('Mobile payment error:', error);
            throw error;
        }
    };

    // Add this function to clear cart after successful order
    const clearCartAfterOrder = async () => {
        try {
            await axiosInstance.delete('/api/cart/clear');
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    // Update the handlePayment function to clear cart after successful order
    const handlePayment = async () => {
        if (!isAddressComplete) {
            setShowAddressModal(true);
            return;
        }
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (selectedPaymentMethod === 'card') {
                // For Stripe, redirect to checkout page
                await processStripePayment();
                // Note: Cart will be cleared in the success page
            } else {
                // Process mobile payment
                const result = await processMobilePayment();

                // Clear cart after successful order
                if (isFromCart) {
                    await clearCartAfterOrder();
                }

                // Show success message
                alert(`Order #${result.order.orderNumber} placed successfully!`);

                // Call success callback
                if (onOrderSuccess) {
                    onOrderSuccess(result.order);
                }

                // Reset form
                setMobilePayment({
                    phoneNumber: '',
                    accountNumber: ''
                });

                // Close modal
                onClose();
            }
        } catch (error) {
            alert('Order failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/80 flex items-center justify-center z-50 p-4">
            {/* Address required modal */}
            {showAddressModal && !isAddressComplete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 relative">
                        <h3 className="text-lg font-semibold mb-2">Address Required</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Please add your shipping address in your profile before proceeding to payment.
                        </p>
                        <ul className="text-xs text-red-500 mb-4 list-disc ml-5 space-y-1">
                            {!user?.phone && <li>Phone number missing</li>}
                            {!user?.address?.location && <li>Street / Location missing</li>}
                            {!user?.address?.city && <li>City missing</li>}
                            {!user?.address?.state && <li>State missing</li>}
                            {!user?.address?.zipCode && <li>ZIP Code missing</li>}
                            {!user?.address?.country && <li>Country missing</li>}
                        </ul>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowAddressModal(false); onClose(); }}
                                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <Link
                                href="/customers/profile"
                                className="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 font-medium"
                            >
                                Go to Profile
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                {!isAddressComplete && (
                    <div className="absolute top-0 left-0 right-0 bg-amber-100 text-amber-800 text-sm px-4 py-2 rounded-t-lg flex items-center gap-2">
                        <span>⚠️ Add a complete shipping address to enable payment.</span>
                    </div>
                )}
                <div className={`flex items-center justify-between p-6 border-b ${!isAddressComplete ? 'pt-10' : ''}`}>
                    <h2 className="text-2xl font-semibold">Checkout</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Shipping Info */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                                <div className={`p-4 rounded-lg ${isAddressComplete ? 'bg-gray-50' : 'bg-red-50 border border-red-200'}`}>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Name:</strong> {user?.name || 'N/A'}</div>
                                        <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
                                        <div><strong>Phone:</strong> {user?.phone || 'N/A'}</div>
                                        <div><strong>Address:</strong> {user?.address?.location || 'N/A'}</div>
                                        <div><strong>City:</strong> {user?.address?.city || 'N/A'}</div>
                                        <div><strong>State:</strong> {user?.address?.state || 'N/A'}</div>
                                        <div><strong>ZIP:</strong> {user?.address?.zipCode || 'N/A'}</div>
                                        <div><strong>Country:</strong> {user?.address?.country || 'N/A'}</div>
                                    </div>
                                    {!isAddressComplete && (
                                        <div className="mt-3">
                                            <Link
                                                href="/profile"
                                                className="inline-block text-xs font-medium text-indigo-600 hover:underline"
                                            >
                                                Add / Edit Address
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                                <div className="space-y-3">
                                    {['card', 'easypaisa', 'jazzcash'].map(method => (
                                        <label
                                            key={method}
                                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${(!isAddressComplete) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method}
                                                checked={selectedPaymentMethod === method}
                                                onChange={(e) => isAddressComplete && setSelectedPaymentMethod(e.target.value)}
                                                className="mr-3"
                                                disabled={loading || !isAddressComplete}
                                            />
                                            {method === 'card' && <CreditCard size={20} className="mr-2 text-blue-600" />}
                                            {method === 'easypaisa' && <Smartphone size={20} className="mr-2 text-green-600" />}
                                            {method === 'jazzcash' && <DollarSign size={20} className="mr-2 text-purple-600" />}
                                            <div>
                                                <span className="font-medium capitalize">
                                                    {method === 'card' ? 'Credit/Debit Card' : method}
                                                </span>
                                                <p className="text-sm text-gray-500">
                                                    {method === 'card'
                                                        ? 'Secure payment via Stripe'
                                                        : 'Mobile wallet payment'}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Payment Details */}
                            {(selectedPaymentMethod === 'easypaisa' || selectedPaymentMethod === 'jazzcash') && (
                                <div className={`${!isAddressComplete ? 'pointer-events-none opacity-50' : ''}`}>
                                    <h3 className="text-lg font-semibold mb-4">
                                        {selectedPaymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} Information
                                    </h3>
                                    <div className="space-y-4">
                                        <input
                                            type="tel"
                                            placeholder="Phone Number *"
                                            value={mobilePayment.phoneNumber}
                                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={loading}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Account Number *"
                                            value={mobilePayment.accountNumber}
                                            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={loading}
                                            required
                                        />
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-700">
                                                You will be redirected to {selectedPaymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'}
                                                to complete your payment. Please ensure you have sufficient balance in your account.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stripe Card Information */}
                            {selectedPaymentMethod === 'card' && (
                                <div className={`bg-blue-50 p-6 rounded-lg ${!isAddressComplete ? 'opacity-50' : ''}`}>
                                    <div className="flex items-center mb-3">
                                        <CreditCard size={24} className="mr-2 text-blue-600" />
                                        <h3 className="text-lg font-semibold">Secure Card Payment</h3>
                                    </div>
                                    <p className="text-gray-700 mb-4">
                                        When you click "Proceed to Payment", you'll be redirected to Stripe's secure checkout
                                        page where you can safely enter your card details.
                                    </p>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex gap-2">
                                            <div className="w-10 h-6 bg-blue-900 text-white rounded text-xs flex items-center justify-center font-semibold">
                                                VISA
                                            </div>
                                            <div className="w-10 h-6 bg-red-600 text-white rounded text-xs flex items-center justify-center font-semibold">
                                                MC
                                            </div>
                                            <div className="w-10 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-semibold">
                                                AMEX
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            🔒 SSL Encrypted & PCI Compliant
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className={`${!isAddressComplete ? 'opacity-60' : ''}`}>
                            <div className="bg-gray-50 rounded-lg p-6 sticky top-0">
                                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                                {/* Order Items */}
                                <div className="space-y-4 mb-6">
                                    {orderItems.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-b-0">
                                            <img
                                                src={item.image || item.images?.[0]?.url || '/placeholder-image.jpg'}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm">{item.name}</h4>
                                                <p className="text-gray-600 text-xs">Qty: {item.quantity}</p>
                                                {item.selectedOptions && (
                                                    <div className="text-xs text-gray-500">
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
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${(orderTotal - shippingCost).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping:</span>
                                        <span>${shippingCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>${orderTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Button */}
                                <button
                                    onClick={handlePayment}
                                    disabled={loading || !isAddressComplete}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {!isAddressComplete
                                        ? 'Add Address to Continue'
                                        : loading
                                            ? (selectedPaymentMethod === 'card' ? 'Redirecting to Stripe...' : 'Processing...')
                                            : (selectedPaymentMethod === 'card' ? 'Proceed to Payment' : 'Place Order')}
                                </button>
                                {!isAddressComplete && (
                                    <p className="text-xs text-center text-red-500 mt-2">
                                        Complete shipping address required.
                                    </p>
                                )}
                                {/* Security Notice */}
                                <div className="mt-4 text-center">
                                    <div className="text-sm text-gray-600">
                                        {selectedPaymentMethod === 'card' ? (
                                            <>🔒 You will be redirected to Stripe's secure checkout</>
                                        ) : (
                                            <>🔒 Secure mobile payment processing</>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;