"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductStore } from '@/Store/ProductStore';
import Header from '@/components/Header';
import CheckoutModal from '@/components/CheckoutModel';
import ProtectedRoute from '@/components/Protectedroute';
import { userauthstore } from '@/Store/UserAuthStore';
import axiosInstance from '@/Store/AxiosInstance';
import toast from 'react-hot-toast';

const ProductDetailsPage = () => {
    const params = useParams();
    const router = useRouter();

    // Get product ID from URL params (can be productId or SKU)
    const productIdentifier = params.id || params.sku;

    const {
        selectedProduct,
        loading,
        error,
        getProductById,
        getProductBySku,
        clearSelectedProduct,
        clearError
    } = ProductStore();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState('gold');
    const [quantity, setQuantity] = useState(1);
    const [selectedMemory, setSelectedMemory] = useState('16GB unified memory');

    // Checkout modal state
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [checkoutItems, setCheckoutItems] = useState([]);

    const { user } = userauthstore()
    // Mock user data - replace with actual user from auth context/store

    // Fetch product data on component mount
    useEffect(() => {
        const fetchProduct = async () => {
            if (productIdentifier) {
                // Clear any previous product and errors
                clearSelectedProduct();
                clearError();

                // Try to fetch by ID first, then by SKU if ID fails
                let product = await getProductById(productIdentifier);
                if (!product) {
                    product = await getProductBySku(productIdentifier);
                }

                if (!product) {
                    // Product not found, redirect to 404 or products page
                    console.error("Product not found");
                }
            }
        };

        fetchProduct();

        // Cleanup function
        return () => {
            clearSelectedProduct();
            clearError();
        };
    }, [productIdentifier, getProductById, getProductBySku, clearSelectedProduct, clearError]);

    const handleImageChange = (index) => {
        setCurrentImageIndex(index);
    };

    const nextImage = () => {
        if (selectedProduct && selectedProduct.images && selectedProduct.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
        }
    };

    const prevImage = () => {
        if (selectedProduct && selectedProduct.images && selectedProduct.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length);
        }
    };

    const increaseQuantity = () => {
        if (selectedProduct && quantity < selectedProduct.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value) || 1;
        const maxQuantity = selectedProduct ? selectedProduct.stock : 999;
        setQuantity(Math.max(1, Math.min(value, maxQuantity)));
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !selectedProduct) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😞</div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => router.push('/products')}
                        className="bg-orange-500 text-white px-6 py-3 rounded font-semibold hover:bg-orange-600 transition-colors"
                    >
                        Browse All Products
                    </button>
                </div>
            </div>
        );
    }

    // Prepare product images
    const productImages = (selectedProduct?.images && selectedProduct.images.length > 0)
        ? selectedProduct.images.map(imgObj => imgObj?.url).filter(url => url) // Extract URLs, filter out falsy ones
        : (selectedProduct?.image ? [selectedProduct.image] : []); // Fallback to single 'image' if 'images' is empty/not present

    // Create thumbnails (first 5 images)
    const thumbnails = productImages;

    // Calculate discount percentage
    const discountPercentage = selectedProduct.originalPrice && selectedProduct.price
        ? Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)
        : selectedProduct.discount || 0;

    // Generate star rating
    const renderStars = (rating = 4.7) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push('★');
        }
        if (hasHalfStar) {
            stars.push('☆');
        }
        while (stars.length < 5) {
            stars.push('☆');
        }

        return stars.join('');
    };

    // Simple console log for add to cart
    const handleAddToCart = async () => {
        if (!user) {
            toast.error("Please login to add items to cart.");
            return;
        }
        if (!selectedProduct) return;

        const productDetails = {
            productId: selectedProduct._id, // assuming _id is the MongoDB ObjectId
            quantity: quantity,

        };

        try {
            const response = await axiosInstance.post('/api/cart/add', productDetails);

            if (response.data.success) {
                console.log('Item added to cart:', response.data.cart);
                alert(`${selectedProduct.name} added to cart!`);
            } else {
                alert(`Error: ${response.data.message}`);
                console.error('Failed to add item:', response.data.message);
            }
        } catch (error) {
            console.error('Network or server error:', error);
            alert('Failed to connect to the server. Please try again later.');
        }
    };


    // Updated handleBuyNow function to open checkout modal
    const handleBuyNow = () => {
        if (!user) {
            toast.error("Please login to proceed.");
            return;
        }
        if (!selectedProduct) return;

        // Prepare checkout items
        const orderItem = {
            ...selectedProduct,
            quantity: quantity,
            selectedOptions: {
                selectedColor,
                selectedMemory
            }
        };

        setCheckoutItems([orderItem]);
        setIsCheckoutModalOpen(true);
    };

    // Handle successful order
    const handleOrderSuccess = (order) => {
        console.log('Order created successfully:', order);

        // You can redirect to order confirmation page
        // router.push(`/orders/${order._id}`);

        // Or show a success message and clear the cart
        alert(`Order #${order._id} placed successfully!`);

        // Reset quantity and close modal
        setQuantity(1);
        setIsCheckoutModalOpen(false);
    };

    return (
        <>
            <ProtectedRoute>
                <div className={`min-h-screen bg-gray-50 ${isCheckoutModalOpen ? 'blur-sm' : ''}`}>
                    <Header />
                    <div className="max-w-7xl mx-auto p-5 bg-white min-h-screen">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            {/* Product Images */}
                            <div className="relative">
                                <img
                                    src={productImages[currentImageIndex] || productImages[0]}
                                    alt={selectedProduct.name}
                                    className="w-full rounded-lg mb-5 h-full object-contain"
                                    onError={(e) => {
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='300' viewBox='0 0 500 300'%3E%3Crect width='500' height='300' fill='%23f0f0f0'/%3E%3Ctext x='250' y='150' text-anchor='middle' fill='%23999' font-size='20'%3ENo Image%3C/text%3E%3C/svg%3E";
                                    }}
                                />

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={prevImage}
                                        className="bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                                        disabled={productImages.length <= 1}
                                    >
                                        ‹
                                    </button>

                                    <div className="flex gap-2 flex-1 overflow-hidden">
                                        {thumbnails.map((thumb, index) => (
                                            <img
                                                key={index}
                                                src={thumb}
                                                alt={`View ${index + 1}`}
                                                className={`w-15 h-15 rounded cursor-pointer border-2 transition-all ${currentImageIndex === index
                                                    ? 'border-orange-500'
                                                    : 'border-transparent hover:border-gray-300'
                                                    }`}
                                                onClick={() => handleImageChange(index)}
                                                onError={(e) => {
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f0f0f0'/%3E%3Ctext x='30' y='35' text-anchor='middle' fill='%23999' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={nextImage}
                                        className="bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                                        disabled={productImages.length <= 1}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="lg:pl-5">
                                {/* Rating */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="text-yellow-500 text-lg">
                                        {renderStars(selectedProduct.rating || 4.7)}
                                    </div>
                                    <span className="text-gray-600 text-sm">
                                        {selectedProduct.rating || '4.7'} Star Rating ({selectedProduct.reviews || '21,671'} User feedback)
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl font-semibold mb-4 leading-tight">
                                    {selectedProduct.name}
                                </h1>

                                {/* Product Status Badges */}
                                <div className="flex gap-2 mb-4">
                                    {selectedProduct.isHot && (
                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                                            🔥 HOT
                                        </span>
                                    )}
                                    {selectedProduct.isTrending && (
                                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold">
                                            📈 TRENDING
                                        </span>
                                    )}
                                    {selectedProduct.isNew && (
                                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold">
                                            ⚡ NEW
                                        </span>
                                    )}
                                    {selectedProduct.isFeatured && (
                                        <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs font-semibold">
                                            🏆 FEATURED
                                        </span>
                                    )}
                                </div>

                                {/* Product Meta */}
                                <div className="grid grid-cols-2 gap-5 mb-5 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>SKU:</span>
                                        <span>{selectedProduct.sku}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Availability:</span>
                                        <span className={selectedProduct.stock > 0 ? "text-green-600" : "text-red-600"}>
                                            {selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock})` : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Brand:</span>
                                        <span>{selectedProduct.brand || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Category:</span>
                                        <span>{selectedProduct.category}</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-8">
                                    <span className="text-3xl font-semibold text-blue-600">${selectedProduct.price}</span>
                                    {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                                        <>
                                            <span className="text-lg text-gray-500 line-through ml-3">
                                                ${selectedProduct.originalPrice}
                                            </span>
                                            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold ml-3">
                                                {discountPercentage}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Options */}

                                {/* Description */}
                                {selectedProduct.description && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold mb-2">Description</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {selectedProduct.description}
                                        </p>
                                    </div>
                                )}

                                {/* Short Description */}
                                {selectedProduct.shortDescription && (
                                    <div className="mb-6">
                                        <p className="text-gray-700 text-sm italic">
                                            {selectedProduct.shortDescription}
                                        </p>
                                    </div>
                                )}

                                {/* Tags */}
                                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                                    <div className="mb-6">
                                        <label className="block font-semibold mb-2">Tags</label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProduct.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                                        <button
                                            onClick={decreaseQuantity}
                                            className="bg-gray-100 px-3 py-2 hover:bg-gray-200 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                                            disabled={quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity.toString().padStart(2, '0')}
                                            onChange={handleQuantityChange}
                                            className="w-16 text-center py-2 border-0 focus:outline-none"
                                            min="1"
                                            max={selectedProduct.stock}
                                        />
                                        <button
                                            onClick={increaseQuantity}
                                            className="bg-gray-100 px-3 py-2 hover:bg-gray-200 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                                            disabled={quantity >= selectedProduct.stock}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {selectedProduct.stock} items available
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 mb-8">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-2 bg-orange-500 text-white px-6 py-3 rounded font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={selectedProduct.stock === 0}
                                    >
                                        ADD TO CART 🛒
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={selectedProduct.stock === 0}
                                    >
                                        BUY NOW
                                    </button>
                                </div>

                                {/* Out of Stock Message */}
                                {selectedProduct.stock === 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                                        <p className="text-red-700 font-medium">This product is currently out of stock.</p>
                                        <p className="text-red-600 text-sm">Please check back later or contact us for restock information.</p>
                                    </div>
                                )}

                                {/* Secondary Actions */}
                                <div className="flex items-center gap-5 mb-8 text-sm">
                                    <a href="#" className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
                                        ♡ Add to Wishlist
                                    </a>
                                    <a href="#" className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
                                        ⚖ Add to Compare
                                    </a>
                                    <div className="flex items-center gap-3 ml-auto">
                                        <span className="font-semibold">Share product:</span>
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center text-xs cursor-pointer hover:bg-blue-700">
                                                f
                                            </div>
                                            <div className="w-8 h-8 bg-blue-400 text-white rounded flex items-center justify-center text-xs cursor-pointer hover:bg-blue-500">
                                                t
                                            </div>
                                            <div className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center text-xs cursor-pointer hover:bg-red-700">
                                                p
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Specifications */}
                                {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="font-semibold mb-3">Specifications</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="space-y-2">
                                                {selectedProduct.specifications.map((spec, index) => (
                                                    <div key={index} className="flex justify-between py-1 border-b border-gray-200 last:border-b-0">
                                                        <span className="text-gray-600 text-sm">{spec.key}:</span>
                                                        <span className="text-gray-800 text-sm font-medium">{spec.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Guarantee Section */}
                                <div className="border-t border-gray-200 pt-5">
                                    <div className="font-semibold mb-4">100% Guarantee Safe Checkout</div>
                                    <div className="flex gap-2 flex-wrap">
                                        <div className="w-10 h-6 bg-blue-900 text-white rounded text-xs flex items-center justify-center font-semibold">
                                            VISA
                                        </div>
                                        <div className="w-10 h-6 bg-red-600 text-white rounded text-xs flex items-center justify-center font-semibold">
                                            MC
                                        </div>
                                        <div className="w-10 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-semibold">
                                            AMEX
                                        </div>
                                        <div className="w-10 h-6 bg-orange-600 text-white rounded text-xs flex items-center justify-center font-semibold">
                                            DISC
                                        </div>
                                        <div className="w-10 h-6 bg-blue-700 text-white rounded text-xs flex items-center justify-center font-semibold">
                                            PP
                                        </div>
                                        <div className="w-10 h-6 bg-gray-300 text-gray-700 rounded text-xs flex items-center justify-center font-semibold">
                                            GPay
                                        </div>
                                        <div className="w-10 h-6 bg-gray-300 text-gray-700 rounded text-xs flex items-center justify-center font-semibold">
                                            APay
                                        </div>
                                        <div className="w-10 h-6 bg-gray-300 text-gray-700 rounded text-xs flex items-center justify-center font-semibold">
                                            Shop
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checkout Modal - Positioned outside the blurred content */}
                <CheckoutModal
                    isOpen={isCheckoutModalOpen}
                    onClose={() => setIsCheckoutModalOpen(false)}
                    orderItems={checkoutItems}
                    user={user}
                    onOrderSuccess={handleOrderSuccess}

                />
            </ProtectedRoute>
        </>
    );
};

export default ProductDetailsPage;