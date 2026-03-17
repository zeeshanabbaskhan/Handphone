"use client"
import Header from '@/components/Header';
import CheckoutModal from '@/components/CheckoutModel';
import { userauthstore } from '@/Store/UserAuthStore';
import useCartStore from '@/Store/CartStore';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/Protectedroute';

const CartPage = () => {
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const { user } = userauthstore();
    const router = useRouter();

    // Use the cart store
    const {
        cartItems,
        loading,
        updatingItem,
        couponCode,
        appliedCoupon,
        getSubtotal,
        getTotal,
        getTax,
        getShipping,
        getDiscount,
        getCheckoutItems,
        fetchCart,
        updateQuantity,
        removeItem,
        clearCart,
        setCouponCode,
        applyCoupon,
        removeCoupon,
        resetCart
    } = useCartStore();

    // Fetch cart data from backend
    useEffect(() => {
        console.log('1st ..... in cart page User:', user);
        if (user) {
            console.log('in cart page User:', user);
            fetchCart();
        }
    }, [user, fetchCart]);

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty');
            return;
        }
        setIsCheckoutModalOpen(true);
    };

    const handleOrderSuccess = (order) => {
        alert(`Order #${order.orderNumber} placed successfully!`);
        resetCart();
        setIsCheckoutModalOpen(false);
        router.push('/customers/orders');
    };

    // Calculate derived values
    const subtotal = getSubtotal();
    const shipping = getShipping();
    const discount = getDiscount();
    const tax = getTax();
    const total = getTotal();
    const checkoutItems = getCheckoutItems();

    return (
        <>
            <ProtectedRoute>
                <Header />
                <div className={`min-h-screen bg-gray-50 py-8 ${isCheckoutModalOpen ? 'blur-sm' : ''}`}>
                    <div className="max-w-7xl mx-auto px-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Shopping Cart Section */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-lg shadow-sm p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-semibold text-gray-900">Shopping Cart</h2>
                                            {cartItems.length > 0 && (
                                                <button
                                                    onClick={clearCart}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Clear Cart
                                                </button>
                                            )}
                                        </div>

                                        {cartItems.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="text-gray-400 mb-4">
                                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                                                <p className="text-gray-600 mb-6">Add some products to get started</p>
                                                <button
                                                    onClick={() => router.push('/customers/products')}
                                                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                                                >
                                                    Continue Shopping
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Cart Header */}
                                                <div className="hidden md:grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 border-b pb-4 mb-4">
                                                    <div className="col-span-2">PRODUCTS</div>
                                                    <div className="text-center">PRICE</div>
                                                    <div className="text-center">QUANTITY</div>
                                                    <div className="text-center">SUB-TOTAL</div>
                                                    <div></div>
                                                </div>

                                                {/* Cart Items */}
                                                <div className="space-y-4">
                                                    {cartItems.map((item) => {
                                                        const product = item.product || item;
                                                        const itemPrice = product.price || 0;
                                                        const isUpdating = updatingItem === item._id;

                                                        return (
                                                            <div key={item._id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center py-4 border-b border-gray-100">
                                                                {/* Product Info */}
                                                                <div className="md:col-span-2 flex items-center gap-4">
                                                                    <button
                                                                        onClick={() => removeItem(item._id)}
                                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                                        disabled={isUpdating}
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                    <img
                                                                        src={product.images?.[0]?.url || product.image || '/placeholder-image.jpg'}
                                                                        alt={product.name}
                                                                        className="w-16 h-12 object-cover rounded border"
                                                                        onError={(e) => {
                                                                            e.target.src = '/placeholder-image.jpg';
                                                                        }}
                                                                    />
                                                                    <div>
                                                                        <h3 className="font-medium text-gray-900 text-sm leading-tight">
                                                                            {product.name}
                                                                        </h3>
                                                                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                {Object.entries(item.selectedOptions).map(([key, value]) => (
                                                                                    <span key={key} className="mr-2">
                                                                                        {key}: {value}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Price */}
                                                                <div className="text-center">
                                                                    <div className="font-semibold">${itemPrice.toFixed(2)}</div>
                                                                </div>

                                                                {/* Quantity */}
                                                                <div className="flex items-center justify-center">
                                                                    <div className="flex items-center border border-gray-300 rounded">
                                                                        <button
                                                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                                            className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                                                                            disabled={isUpdating || item.quantity <= 1}
                                                                        >
                                                                            −
                                                                        </button>
                                                                        <span className="px-4 py-1 min-w-12 text-center">
                                                                            {isUpdating ? (
                                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
                                                                            ) : (
                                                                                item.quantity.toString().padStart(2, '0')
                                                                            )}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                                            className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                                                                            disabled={isUpdating}
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Subtotal */}
                                                                <div className="text-center font-semibold">
                                                                    ${(itemPrice * item.quantity).toFixed(2)}
                                                                </div>

                                                                {/* Mobile Remove Button */}
                                                                <div className="md:hidden">
                                                                    <button
                                                                        onClick={() => removeItem(item._id)}
                                                                        className="text-red-500 hover:text-red-700 text-sm disabled:text-gray-400"
                                                                        disabled={isUpdating}
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Cart Actions */}
                                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t">
                                                    <button
                                                        onClick={() => router.push('/customers/products')}
                                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                        </svg>
                                                        CONTINUE SHOPPING
                                                    </button>

                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 border-2 border-blue-400 rounded-full flex items-center justify-center">
                                                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={fetchCart}
                                                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                                                    >
                                                        REFRESH CART
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Cart Totals Section */}
                                {cartItems.length > 0 && (
                                    <div className="space-y-6">
                                        {/* Totals Card */}
                                        <div className="bg-white rounded-lg shadow-sm p-6">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Cart Totals</h3>

                                            <div className="space-y-4">
                                                <div className="flex justify-between text-gray-600">
                                                    <span>Sub-total</span>
                                                    <span>${subtotal.toFixed(2)}</span>
                                                </div>

                                                <div className="flex justify-between text-gray-600">
                                                    <span>Shipping</span>
                                                    <span className={shipping === 0 ? "text-green-600" : ""}>
                                                        {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                                                    </span>
                                                </div>

                                                {discount > 0 && (
                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Discount</span>
                                                        <span className="text-green-600">-${discount.toFixed(2)}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between text-gray-600 border-b pb-4">
                                                    <span>Tax</span>
                                                    <span>${tax.toFixed(2)}</span>
                                                </div>

                                                <div className="flex justify-between text-lg font-semibold text-gray-900">
                                                    <span>Total</span>
                                                    <span>${total.toFixed(2)} USD</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleCheckout}
                                                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors mt-6 flex items-center justify-center gap-2"
                                            >
                                                PROCEED TO CHECKOUT
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Coupon Code Card */}
                                        <div className="bg-white rounded-lg shadow-sm p-6">
                                            <h4 className="font-semibold text-gray-900 mb-4">Coupon Code</h4>

                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="Enter coupon code"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />

                                                <button
                                                    onClick={applyCoupon}
                                                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                                                >
                                                    APPLY COUPON
                                                </button>
                                            </div>

                                            {appliedCoupon && (
                                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-green-800">
                                                            Coupon "{appliedCoupon.code}" applied
                                                        </span>
                                                        <button
                                                            onClick={removeCoupon}
                                                            className="text-green-600 hover:text-green-800"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="text-sm text-green-600 mt-1">
                                                        You saved ${appliedCoupon.discount}!
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Checkout Modal */}
                <CheckoutModal
                    isOpen={isCheckoutModalOpen}
                    onClose={() => setIsCheckoutModalOpen(false)}
                    orderItems={checkoutItems}
                    onOrderSuccess={handleOrderSuccess}
                    isFromCart={true}
                />
            </ProtectedRoute>
        </>
    );
};

export default CartPage;