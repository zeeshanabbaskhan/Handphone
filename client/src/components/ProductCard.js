"use client"
import axiosInstance from '@/Store/AxiosInstance';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FaHeart, FaEye, FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userauthstore } from '@/Store/UserAuthStore';
import Link from 'next/link';

const ProductCard = ({
    id,
    name,
    description,
    shortDescription,
    image,
    images,
    price,
    originalPrice,
    discount,
    tags,
    isHot,
    isTrending,
    isNew,
    isFeatured,
    rating,
    reviews,
    brand,
    stock,
    status
}) => {



    // Determine which image to use (primary from images array or fallback)
    const productImage = images && images.length > 0
        ? images.find(img => img.isPrimary)?.url || images[0]?.url || image
        : image || "/next.svg";

    const router = useRouter()
    const { user } = userauthstore();

    const handleviewproduct = () => {
        router.push(`/customers/products/details/${id}`);
    }

    // Calculate rating stars
    const renderStars = (rating) => {
        const numRating = parseFloat(rating) || 4;
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 !== 0;

        return (
            <div className="flex items-center text-yellow-400 text-sm mb-1">
                {'★'.repeat(fullStars)}
                {hasHalfStar && '☆'}
                {'☆'.repeat(5 - Math.ceil(numRating))}
                <span className="text-gray-600 ml-1 text-xs">({reviews || 0})</span>
            </div>
        );
    };

    // Determine which tag to show (priority: Hot > Trending > New > Featured)
    const getDisplayTag = () => {
        if (isHot) return { text: 'HOT', color: 'bg-red-500' };
        if (isTrending) return { text: 'TRENDING', color: 'bg-blue-500' };
        if (isNew) return { text: 'NEW', color: 'bg-green-500' };
        if (isFeatured) return { text: 'FEATURED', color: 'bg-purple-500' };
        return null;
    };

    const displayTag = getDisplayTag();
    const displayDescription = shortDescription || description;

    // Check if product is out of stock
    const isOutOfStock = status === 'out_of_stock' || stock === 0;

    const handleAddToCart = async () => {
        if (!user) {
            toast.error("Please login to add items to cart.");
            return;
        }
        if (isOutOfStock) return; // Prevent adding to cart if out of stock


        const productDetails = {
            productId: id, // assuming _id is the MongoDB ObjectId
            quantity: 1,
        };

        try {
            const response = await axiosInstance.post('/api/cart/add', productDetails);

            if (response.data.success) {
                console.log('Item added to cart:', response.data.cart);
                toast.success(`${name} added to cart!`);

            } else {
                toast.error(`Error: ${response.data.message}`);
                console.error('Failed to add item:', response.data.message);

            }
        } catch (error) {
            console.error('Network or server error:', error);
            toast.error('Failed to connect to the server. Please try again later.');
        }
    }

    return (
        <div className="bg-white border rounded-lg p-4 shadow-md hover:shadow-lg transition-all flex flex-col justify-between relative">
            {/* Out of stock overlay */}
            {isOutOfStock && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                        OUT OF STOCK
                    </span>
                </div>
            )}

            {/* Discount & Tag */}
            <div className="flex items-center justify-between mb-2">
                {discount && (
                    <span className="bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded">
                        {discount}% OFF
                    </span>
                )}
                {displayTag && (
                    <span className={`${displayTag.color} text-white text-xs font-bold px-2 py-1 rounded`}>
                        {displayTag.text}
                    </span>
                )}
            </div>

            {/* Product Image */}
            <div onClick={handleviewproduct} className="flex justify-center items-center h-40 mb-4">
                <img
                    src={productImage}
                    alt={name}
                    className="max-h-full object-contain"
                    onError={(e) => {
                        e.target.src = "/airbuds.png"; // Fallback image
                    }}
                />
            </div>

            {/* Product Info */}
            <div onClick={handleviewproduct} className="mb-2">
                {renderStars(rating)}
                <h3 className="font-semibold text-sm text-gray-800 leading-5 mb-1 line-clamp-2">
                    {name}
                </h3>
                {displayDescription && (
                    <p className="text-xs text-gray-500 mb-1 line-clamp-2">
                        {displayDescription}
                    </p>
                )}
                {brand && (
                    <p className="text-xs text-gray-400 mb-1">
                        Brand: {brand}
                    </p>
                )}
            </div>

            {/* Price Section */}
            <div className="mb-4">
                {originalPrice && originalPrice > price && (
                    <p className="text-sm line-through text-gray-400">${originalPrice}</p>
                )}
                <p className="text-lg font-semibold text-blue-500">${price}</p>
                {stock && stock > 0 && stock <= 10 && (
                    <p className="text-xs text-orange-500">Only {stock} left in stock!</p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 justify-between">

                <Link
                    className="p-2 border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-50"
                    href="/customers/products/cart"
                >
                    <FaShoppingCart className="text-gray-500 text-sm" />
                </Link>
                <button
                    onClick={handleviewproduct}
                    className="p-2 border border-gray-300 rounded-full hover:bg-gray-100"
                    title="Quick View"
                >
                    <FaEye className="text-gray-500 text-sm" />
                </button>
                <button
                    className={`${isOutOfStock
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600'
                        } text-white text-sm px-4 py-2 rounded ml-auto transition-colors`}
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                >
                    {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}

                </button>
            </div>

            {/* Tags display (optional, if you want to show product tags) */}
            {tags && tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                    {tags.length > 3 && (
                        <span className="text-gray-400 text-xs">
                            +{tags.length - 3} more
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductCard;