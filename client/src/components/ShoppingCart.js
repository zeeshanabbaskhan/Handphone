import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import useCartStore from '@/store/CartStore';
import CheckoutModal from '@/components/CheckoutModel';

const CartDrawer = ({ isOpen, onClose, user }) => {
    const {
        cartItems,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getCartSummary
    } = useCartStore();

    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [cartSummary, setCartSummary] = useState({
        items: [],
        itemsCount: 0,
        subtotal: 0,
        shippingCost: 5,
        total: 0
    });

    // Update cart summary when cart items change
    useEffect(() => {
        setCartSummary(getCartSummary());
    }, [cartItems, getCartSummary]);

    // Make clearCart available globally for checkout modal
    useEffect(() => {
        window.clearCart = clearCart;
        return () => {
            delete window.clearCart;
        };
    }, [clearCart]);

    const handleQuantityChange = (cartId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(cartId);
        } else {
            updateCartItemQuantity(cartId, newQuantity);
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty');
            return;
        }
        setIsCheckoutModalOpen(true);
    };

    const handleOrderSuccess = (order) => {
        console.log('Order placed from cart:', order);
        onClose(); // Close cart drawer
    };

    // Convert cart items to checkout format
    const checkoutItems = cartItems.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || item.images?.[0]?.url,
        selectedOptions: item.selectedOptions,
        stock: item.stock
    }));

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
                {/* Cart Drawer */}
                <div
                    className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <ShoppingCart size={20} />
                            Shopping Cart ({cartSummary.itemsCount})
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Cart Content */}
                    <div className="flex flex-col h-full">
                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 mb-4">Your cart is empty</p>
                                    <button
                                        onClick={onClose}
                                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.cartId} className="flex items-center space-x-4 p-4 border rounded-lg">
                                            {/* Product Image */}
                                            <img
                                                src={item.image || item.images?.[0]?.url}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f0f0f0'/%3E%3Ctext x='32' y='36' text-anchor='middle' fill='%23999' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                                                }}
                                            />

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-sm text-gray-900 truncate">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">${item.price}</p>

                                                {/* Selected Options */}
                                                {item.selectedOptions && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {item.selectedOptions.selectedColor && (
                                                            <span className="mr-2">Color: {item.selectedOptions.selectedColor}</span>
                                                        )}
                                                        {item.selectedOptions.selectedMemory && (
                                                            <span>Memory: {item.selectedOptions.selectedMemory}</span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Quantity Controls */}
                                                <div className="flex items-center mt-2 space-x-2">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                                                        className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 transition-colors"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={14} />
                                                    </button>

                                                    <span className="w-8 text-center text-sm font-medium">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 transition-colors"
                                                        disabled={item.quantity >= item.stock}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price and Remove */}
                                            <div className="text-right">
                                                <p className="font-semibold text-sm">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                <button
                                                    onClick={() => removeFromCart(item.cartId)}
                                                    className="mt-2 p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cart Footer */}
                        {cartItems.length > 0 && (
                            <div className="border-t p-4 space-y-4">
                                {/* Summary */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal ({cartSummary.itemsCount} items):</span>
                                        <span>${cartSummary.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Shipping:</span>
                                        <span>${cartSummary.shippingCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>${cartSummary.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        Proceed to Checkout
                                    </button>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                        >
                                            Continue Shopping
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to clear your cart?')) {
                                                    clearCart();
                                                }
                                            }}
                                            className="flex-1 bg-red-100 text-red-600 py-2 px-4 rounded-lg font-medium hover:bg-red-200 transition-colors"
                                        >
                                            Clear Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                orderItems={checkoutItems}
                user={user}
                onOrderSuccess={handleOrderSuccess}
                isFromCart={true}
            />
        </>
    );
};

// Cart Icon Component for Header
const CartIcon = ({ user }) => {
    const { cartItems, getCartItemsCount, openCart } = useCartStore();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const itemsCount = getCartItemsCount();

    return (
        <>
            {/* Cart Icon */}
            <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
                <ShoppingCart size={24} />
                {itemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {itemsCount > 99 ? '99+' : itemsCount}
                    </span>
                )}
            </button>

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                user={user}
            />
        </>
    );
};

// Mini Cart for Product Pages
const MiniCart = ({ user }) => {
    const { cartItems, getCartSummary } = useCartStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartSummary = getCartSummary();

    if (cartItems.length === 0) return null;

    return (
        <>
            {/* Mini Cart Widget */}
            <div className="fixed bottom-4 right-4 z-40">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div
                        className="flex items-center justify-between p-3 bg-blue-600 text-white cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={18} />
                            <span className="font-medium">{cartSummary.itemsCount} items</span>
                        </div>
                        <span className="font-semibold">${cartSummary.total.toFixed(2)}</span>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <div className="p-3 max-w-xs">
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {cartItems.slice(0, 3).map((item) => (
                                    <div key={item.cartId} className="flex items-center gap-2 text-sm">
                                        <img
                                            src={item.image || item.images?.[0]?.url}
                                            alt={item.name}
                                            className="w-8 h-8 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate font-medium">{item.name}</p>
                                            <p className="text-gray-600">{item.quantity}x ${item.price}</p>
                                        </div>
                                    </div>
                                ))}
                                {cartItems.length > 3 && (
                                    <p className="text-xs text-gray-500 text-center">
                                        +{cartItems.length - 3} more items
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setIsCartOpen(true);
                                    setIsExpanded(false);
                                }}
                                className="w-full mt-3 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                View Cart & Checkout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                user={user}
            />
        </>
    );
};

// Updated Add to Cart Button Component
const AddToCartButton = ({
    product,
    quantity = 1,
    selectedOptions = {},
    className = "",
    children = "Add to Cart",
    onSuccess
}) => {
    const { addToCart } = useCartStore();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async () => {
        if (!product) return;

        setIsAdding(true);

        try {
            addToCart(product, quantity, selectedOptions);

            // Show success feedback
            if (onSuccess) {
                onSuccess();
            } else {
                // Simple success notification
                const notification = document.createElement('div');
                notification.textContent = 'Added to cart!';
                notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
                document.body.appendChild(notification);

                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 2000);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item to cart');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={isAdding || !product || product.stock === 0}
            className={`${className} ${isAdding ? 'opacity-75 cursor-not-allowed' : ''
                } ${product?.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : ''
                }`}
        >
            {isAdding ? 'Adding...' : children}
        </button>
    );
};

export { CartDrawer, CartIcon, MiniCart, AddToCartButton };
export default CartDrawer;