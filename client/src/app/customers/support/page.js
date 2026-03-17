"use client"
import Header from '@/components/Header';
import React, { useState } from 'react';

const SupportPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const serviceCategories = [
        { id: 1, icon: '📋', title: 'Track Order', description: 'Check your order status' },
        { id: 2, icon: '🔐', title: 'Reset Password', description: 'Recover your account' },
        { id: 3, icon: '💳', title: 'Payment Option', description: 'Payment methods & billing' },
        { id: 4, icon: '👤', title: 'User & Account', description: 'Account management' },
        { id: 5, icon: '💰', title: 'Wishlist & Coupons', description: 'Manage your savings' },
        { id: 6, icon: '🚚', title: 'Shipping & Billing', description: 'Delivery information' },
        { id: 7, icon: '🛍️', title: 'Shopping Cart & Wishlist', description: 'Cart and wishlist help' },
        { id: 8, icon: '💬', title: 'Sell on Olicon', description: 'Become a seller' }
    ];

    const popularTopics = [
        "How do I return my item?",
        "What's a Coupon/Promo Code?",
        "How long is the refund process?",
        "What are the Delivery Timelines?",
        "What is 'Discover Your Next Campaign 2025'?",
        "What is the Coupon & Gift Offer in this Campaign?",
        "How to cancel Olicon Order",
        "Are My Digital and Device Community",
        "How to change my shipping?"
    ];

    const handleSearch = () => {
        console.log('Searching for:', searchQuery);
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        console.log('Selected category:', category.title);
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50">
                {/* Header Section */}
                <div className="bg-white px-6 py-12">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-block bg-yellow-400 text-black px-3 py-1 rounded text-sm font-semibold mb-4">
                                    HELP CENTER
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                                    How we can help you!
                                </h1>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            placeholder="Enter your question or keyword"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            🔍
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                                    >
                                        SEARCH
                                    </button>
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <img
                                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f8fafc'/%3E%3C!-- Woman silhouette --%3E%3Cpath d='M280 80c0-15 12-25 25-25s25 10 25 25c0 15-12 25-25 25s-25-10-25-25z' fill='%23d4a574'/%3E%3Cpath d='M270 105h70c5 0 10 5 10 10v80c0 5-5 10-10 10h-70c-5 0-10-5-10-10v-80c0-5 5-10 10-10z' fill='%232d3748'/%3E%3Cpath d='M265 120h15v60h-15z' fill='%23d4a574'/%3E%3Cpath d='M325 120h15v60h-15z' fill='%23d4a574'/%3E%3C!-- Laptop --%3E%3Cpath d='M180 140h120c8 0 15 7 15 15v60c0 8-7 15-15 15H180c-8 0-15-7-15-15v-60c0-8 7-15 15-15z' fill='%23e2e8f0'/%3E%3Cpath d='M185 145h110c5 0 10 5 10 10v50c0 5-5 10-10 10H185c-5 0-10-5-10-10v-50c0-5 5-10 10-10z' fill='%23000'/%3E%3Cpath d='M175 230h130c3 0 5 2 5 5v5c0 3-2 5-5 5H175c-3 0-5-2-5-5v-5c0-3 2-5 5-5z' fill='%23cbd5e0'/%3E%3C/svg%3E"
                                    alt="Customer Support"
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div className="py-16 px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                            What can we assist you with today?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {serviceCategories.map((category) => (
                                <div
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category)}
                                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                                >
                                    <div className="text-orange-500 text-2xl mb-3">{category.icon}</div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
                                    <p className="text-sm text-gray-600">{category.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Popular Topics */}
                <div className="bg-white py-16 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Topics</h2>
                            <div className="inline-block w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-500 text-lg">+</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {popularTopics.map((topic, index) => (
                                <div key={index} className="text-left">
                                    <a
                                        href="#"
                                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                    >
                                        • {topic}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-gray-100 py-16 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-block bg-blue-500 text-white px-4 py-2 rounded mb-6">
                            CONTACT US
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Don't find your answer.
                        </h2>
                        <p className="text-xl text-gray-600 mb-12">Contact with us</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Phone Support */}
                            <div className="bg-white rounded-lg p-8 shadow-sm">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-blue-600 text-2xl">📞</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Call us now</h3>
                                <p className="text-gray-600 mb-1">We are available from 9:00 AM to 5:00 PM</p>
                                <p className="text-gray-600 mb-4">Ready to answer your questions.</p>
                                <div className="text-2xl font-bold text-gray-900 mb-4">+1 202 555-0126</div>
                                <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors">
                                    CALL NOW →
                                </button>
                            </div>

                            {/* Chat Support */}
                            <div className="bg-white rounded-lg p-8 shadow-sm">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-green-600 text-2xl">💬</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat with us</h3>
                                <p className="text-gray-600 mb-1">We are available from 9:00 AM to 5:00 PM</p>
                                <p className="text-gray-600 mb-4">Start chatting right away.</p>
                                <div className="text-xl font-semibold text-gray-900 mb-4">Support@olicon.com</div>
                                <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors">
                                    CONTACT US →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SupportPage;