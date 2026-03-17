"use client"
import React, { useState, useEffect } from 'react';

const FilterSidebar = ({ products, onFilterChange, filters }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    // Extract unique categories, brands, and tags from products
    const getUniqueValues = () => {
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
        const allTags = products.flatMap(p => p.tags || []);
        const tags = [...new Set(allTags)];

        return { categories, brands, tags };
    };

    const { categories, brands, tags } = getUniqueValues();

    // Handle category filter change
    const handleCategoryChange = (category, checked) => {
        const newCategories = checked
            ? [...localFilters.categories, category]
            : localFilters.categories.filter(c => c !== category);

        const newFilters = { ...localFilters, categories: newCategories };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    // Handle price range change
    const handlePriceRangeChange = (range) => {
        const newFilters = {
            ...localFilters,
            priceRange: range,
            // Clear custom price inputs when selecting predefined range
            minPrice: '',
            maxPrice: ''
        };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    // Handle custom price input change
    const handleCustomPriceChange = (type, value) => {
        const newFilters = {
            ...localFilters,
            [type]: value,
            // Clear predefined range when using custom inputs
            priceRange: 'all'
        };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    // Handle brand filter change
    const handleBrandChange = (brand, checked) => {
        const newBrands = checked
            ? [...localFilters.brands, brand]
            : localFilters.brands.filter(b => b !== brand);

        const newFilters = { ...localFilters, brands: newBrands };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    // Handle tag filter change
    const handleTagClick = (tag) => {
        const isSelected = localFilters.tags.includes(tag);
        const newTags = isSelected
            ? localFilters.tags.filter(t => t !== tag)
            : [...localFilters.tags, tag];

        const newFilters = { ...localFilters, tags: newTags };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    // Clear all filters
    const clearAllFilters = () => {
        const clearedFilters = {
            categories: [],
            priceRange: 'all',
            minPrice: '',
            maxPrice: '',
            brands: [],
            tags: []
        };
        setLocalFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    return (
        <div className="w-full md:w-64 p-5 bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Clear Filters Button */}
            <div className="mb-4">
                <button
                    onClick={clearAllFilters}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-colors"
                >
                    Clear All Filters
                </button>
            </div>

            {/* Category Section */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 uppercase mb-4">CATEGORY</h3>
                <ul className="space-y-2">
                    {categories.map((category, index) => (
                        <li key={index}>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                                    checked={localFilters.categories.includes(category)}
                                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                                />
                                <span className="text-gray-600 hover:text-blue-600">{category}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price Range Section */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 uppercase mb-4">PRICE RANGE</h3>
                <div className="flex space-x-3 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm text-gray-500 mb-1">Min price</label>
                        <input
                            type="number"
                            placeholder="$0"
                            value={localFilters.minPrice}
                            onChange={(e) => handleCustomPriceChange('minPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm text-gray-500 mb-1">Max price</label>
                        <input
                            type="number"
                            placeholder="$10,000"
                            value={localFilters.maxPrice}
                            onChange={(e) => handleCustomPriceChange('maxPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <ul className="space-y-2">
                    {[
                        { value: 'all', label: 'All Price' },
                        { value: 'under_20', label: 'Under $20' },
                        { value: '25_100', label: '$25 to $100' },
                        { value: '100_300', label: '$100 to $300' },
                        { value: '300_500', label: '$300 to $500' },
                        { value: '500_1000', label: '$500 to $1,000' },
                        { value: '1000_10000', label: '$1,000 to $10,000' }
                    ].map((item, index) => (
                        <li key={index}>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="price-range"
                                    className="form-radio h-4 w-4 text-blue-600 border-gray-300"
                                    checked={localFilters.priceRange === item.value}
                                    onChange={() => handlePriceRangeChange(item.value)}
                                />
                                <span className="text-gray-600 hover:text-blue-600">{item.label}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Popular Brands Section */}
            {brands.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 uppercase mb-4">BRANDS</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {brands.map((brand, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                                    checked={localFilters.brands.includes(brand)}
                                    onChange={(e) => handleBrandChange(brand, e.target.checked)}
                                />
                                <span className="text-gray-600 hover:text-blue-600">{brand}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular Tags Section */}
            {tags.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 uppercase mb-4">POPULAR TAGS</h3>
                    <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 15).map((tag, index) => (
                            <span
                                key={index}
                                onClick={() => handleTagClick(tag)}
                                className={`inline-block px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${localFilters.tags.includes(tag)
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                                    }`}
                            >
                                {tag}
                            </span>
                        ))}
                        {tags.length > 15 && (
                            <span className="text-gray-400 text-sm px-2 py-1">
                                +{tags.length - 15} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Active Filters Summary */}
            {(localFilters.categories.length > 0 ||
                localFilters.brands.length > 0 ||
                localFilters.tags.length > 0 ||
                localFilters.priceRange !== 'all' ||
                localFilters.minPrice !== '' ||
                localFilters.maxPrice !== '') && (
                    <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-800 mb-2">Active Filters:</h4>
                        <div className="text-xs text-gray-600">
                            {localFilters.categories.length > 0 && (
                                <div>Categories: {localFilters.categories.length}</div>
                            )}
                            {localFilters.brands.length > 0 && (
                                <div>Brands: {localFilters.brands.length}</div>
                            )}
                            {localFilters.tags.length > 0 && (
                                <div>Tags: {localFilters.tags.length}</div>
                            )}
                            {(localFilters.priceRange !== 'all' || localFilters.minPrice !== '' || localFilters.maxPrice !== '') && (
                                <div>Price filter active</div>
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
};

export default FilterSidebar;