"use client"
import FilterSidebar from '@/components/FilterSidebar'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard';
import React, { useEffect, useState } from 'react'
import { ProductStore } from '@/Store/ProductStore';
import ProtectedRoute from '@/components/Protectedroute';
import { SlidersHorizontal, X } from 'lucide-react';

const ProductPage = () => {
    const { getallproducts, products } = ProductStore();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filters, setFilters] = useState({
        categories: [],
        priceRange: 'all',
         minPrice: '',
        maxPrice: '',
        brands: [],
        tags: []
    });
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // Fetch products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            await getallproducts();
        };
        fetchProducts();
    }, [getallproducts]);

    // Apply filters whenever products or filters change
    useEffect(() => {
        let filtered = [...products];

        // Category filter
        if (filters.categories.length > 0) {
            filtered = filtered.filter(product =>
                filters.categories.includes(product.category)
            );
        }

        // Price range filter
        if (filters.priceRange !== 'all') {
            switch (filters.priceRange) {
                case 'under_20':
                    filtered = filtered.filter(product => product.price < 20);
                    break;
                case '25_100':
                    filtered = filtered.filter(product => product.price >= 25 && product.price <= 100);
                    break;
                case '100_300':
                    filtered = filtered.filter(product => product.price >= 100 && product.price <= 300);
                    break;
                case '300_500':
                    filtered = filtered.filter(product => product.price >= 300 && product.price <= 500);
                    break;
                case '500_1000':
                    filtered = filtered.filter(product => product.price >= 500 && product.price <= 1000);
                    break;
                case '1000_10000':
                    filtered = filtered.filter(product => product.price >= 1000 && product.price <= 10000);
                    break;
            }
        }

        // Custom price range filter
        if (filters.minPrice !== '' || filters.maxPrice !== '') {
            const min = parseFloat(filters.minPrice) || 0;
            const max = parseFloat(filters.maxPrice) || Infinity;
            filtered = filtered.filter(product =>
                product.price >= min && product.price <= max
            );
        }

        // Brand filter
        if (filters.brands.length > 0) {
            filtered = filtered.filter(product =>
                filters.brands.includes(product.brand)
            );
        }

        // Tag filter
        if (filters.tags.length > 0) {
            filtered = filtered.filter(product =>
                product.tags && filters.tags.some(tag =>
                    product.tags.includes(tag)
                )
            );
        }

        setFilteredProducts(filtered);
    }, [products, filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <ProtectedRoute>
            <div>
                <Header />
                <div className='mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row'>
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block shrink-0">
                        <FilterSidebar
                            products={products}
                            onFilterChange={handleFilterChange}
                            filters={filters}
                        />
                    </div>

                    <div className='flex-1 lg:ml-6'>
                        {/* Mobile Filter Bar */}
                        <div className="lg:hidden mb-4 flex items-center justify-between">
                            <button
                                onClick={() => setMobileFilterOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium active:scale-[.97]"
                            >
                                <SlidersHorizontal size={16} />
                                Filters
                                {(filters.categories.length + filters.brands.length + filters.tags.length > 0 ||
                                    filters.priceRange !== 'all' ||
                                    filters.minPrice !== '' ||
                                    filters.maxPrice !== '') && (
                                        <span className="ml-1 inline-flex items-center justify-center text-[10px] font-semibold bg-white/20 rounded px-1.5">
                                            {filters.categories.length + filters.brands.length + filters.tags.length}
                                        </span>
                                    )}
                            </button>
                            <span className="text-xs text-gray-500">
                                {filteredProducts.length} result{filteredProducts.length !== 1 && 's'}
                            </span>
                        </div>

                        {/* Products Grid */}
                        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <ProductCard key={product.id} {...product} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Filter Drawer */}
                {mobileFilterOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setMobileFilterOpen(false)}
                        />
                        <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl border-r border-gray-200 flex flex-col">
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                                <h2 className="text-sm font-semibold text-gray-700">Filters</h2>
                                <button
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="p-2 rounded hover:bg-gray-100"
                                    aria-label="Close filters"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="overflow-y-auto p-4 flex-1">
                                <FilterSidebar
                                    products={products}
                                    onFilterChange={(f) => {
                                        handleFilterChange(f);
                                    }}
                                    filters={filters}
                                />
                            </div>
                            <div className="p-4 border-t">
                                <button
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-md"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}

export default ProductPage;