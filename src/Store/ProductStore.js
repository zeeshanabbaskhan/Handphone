import { create } from 'zustand'
import axiosInstance from './AxiosInstance'
import toast from 'react-hot-toast'

export const ProductStore = create((set, get) => ({
    products: [],
    selectedProduct: null,
    featuredProducts: [],
    trendingProducts: [],
    newProducts: [],
    hotProducts: [],
    loading: false,
    error: null,

    // Set products
    setProducts: (products) => set({ products: products }),

    // Set selected product
    setSelectedProduct: (product) => set({ selectedProduct: product }),

    // Set loading state
    setLoading: (loading) => set({ loading }),

    // Set error state
    setError: (error) => set({ error }),

    // Add product (existing function)
    addproduct: async (product) => {
        try {
            console.log("Adding product", product);
            set({ loading: true });

            const res = await axiosInstance.post('/product/addproduct', product, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const data = res.data;
            set({
                products: [...get().products, data.product],
                loading: false,
                error: null
            });

            console.log("Product added successfully", data);
            toast.success("Product added successfully");

        } catch (error) {
            console.log(error);
            set({ loading: false, error: error.message });
            toast.error("Failed to add product");
        }
    },

    // Get all products (existing function)
    getallproducts: async () => {
        try {
            set({ loading: true });
            const res = await axiosInstance.get('/product/getallproducts');
            const data = res.data;
            console.log("Products retrieved successfully", data);

            set({
                products: data.products,
                loading: false,
                error: null
            });

        } catch (error) {
            console.error("Error retrieving products:", error);
            set({ loading: false, error: error.message });
            toast.error("Failed to retrieve products");
            return [];
        }
    },

    // Get single product by ID
    getProductById: async (productId) => {
        console.log("in getProductById");

        try {
            set({ loading: true });
            const res = await axiosInstance.get(`/product/${productId}`);
            const data = res.data;

            set({
                selectedProduct: data.product,
                loading: false,
                error: null
            });

            console.log("Product retrieved successfully", data.product);
            return data.product;

        } catch (error) {
            console.error("Error retrieving product:", error);
            set({ loading: false, error: error.message });
            toast.error("Failed to retrieve product");
            return null;
        }
    },

    // Get single product by SKU
    getProductBySku: async (sku) => {
        try {
            set({ loading: true });
            const res = await axiosInstance.get(`/product/sku/${sku}`);
            const data = res.data;

            set({
                selectedProduct: data.product,
                loading: false,
                error: null
            });

            console.log("Product retrieved successfully", data.product);
            return data.product;

        } catch (error) {
            console.error("Error retrieving product by SKU:", error);
            set({ loading: false, error: error.message });
            toast.error("Failed to retrieve product");
            return null;
        }
    },

    // Get products by category
    getProductsByCategory: async (category, page = 1, limit = 10) => {
        try {
            set({ loading: true });
            const res = await axiosInstance.get(`/product/category/${category}?page=${page}&limit=${limit}`);
            const data = res.data;

            set({
                products: data.products,
                loading: false,
                error: null
            });

            console.log("Products by category retrieved successfully", data);
            return data;

        } catch (error) {
            console.error("Error retrieving products by category:", error);
            set({ loading: false, error: error.message });
            toast.error("Failed to retrieve products");
            return null;
        }
    },

    // Search products
    searchProducts: async (searchParams) => {
        try {
            set({ loading: true });
            const queryString = new URLSearchParams(searchParams).toString();
            const res = await axiosInstance.get(`/product/search?${queryString}`);
            const data = res.data;

            set({
                products: data.products,
                loading: false,
                error: null
            });

            console.log("Product search completed", data);
            return data;

        } catch (error) {
            console.error("Error searching products:", error);
            set({ loading: false, error: error.message });
            toast.error("Failed to search products");
            return null;
        }
    },

    // Get featured products
    getFeaturedProducts: async (limit = 8) => {
        try {
            set({ loading: true });
            const res = await axiosInstance.get(`/product/featured?limit=${limit}`);
            const data = res.data;

            set({
                featuredProducts: data.products,
                loading: false,
                error: null
            });

            console.log("Featured products retrieved successfully", data);
            return data.products;

        } catch (error) {
            console.error("Error retrieving featured products:", error);
            set({ loading: false, error: error.message });
            toast.error("Failed to retrieve featured products");
            return [];
        }
    },

    // Get trending products
    getTrendingProducts: async (limit = 8) => {
        try {
            set({ loading: true });
            const res = await axiosInstance.get(`/product/trending?limit=${limit}`);
            const data = res.data;

            set({
                trendingProducts: data.products,
                loading: false,
                error: null
            });

            console.log("Trending products retrieved successfully", data);
            return data.products;

        } catch (error) {
            console.error("Error retrieving trending products:", error);
            set({ loading: false, error: error.message });
            toast.error("Failed to retrieve trending products");
            return [];
        }
    },

    // Get new products
    getNewProducts: async (limit = 8) => {
        try {
            set({ loading: true });
            const res = await axiosInstance.get(`/product/new?limit=${limit}`);
            const data = res.data;

            set({
                newProducts: data.products,
                loading: false,
                error: null
            });

            console.log("New products retrieved successfully", data);
            return data.products;

        } catch (error) {
            console.error("Error retrieving new products:", error);
            set({ loading: false, error: error.message });
            toast.error("Failed to retrieve new products");
            return [];
        }
    },

    // Get hot products
    getHotProducts: async (limit = 8) => {
        try {
            set({ loading: true });
            const res = await axiosInstance.get(`/product/hot?limit=${limit}`);
            const data = res.data;

            set({
                hotProducts: data.products,
                loading: false,
                error: null
            });

            console.log("Hot products retrieved successfully", data);
            return data.products;

        } catch (error) {
            console.error("Error retrieving hot products:", error);
            set({ loading: false, error: error.message });
            toast.error("Failed to retrieve hot products");
            return [];
        }
    },

    // Get product statistics
    getProductStats: async () => {
        try {
            set({ loading: true });
            const res = await axiosInstance.get('/product/stats');
            const data = res.data;

            set({ loading: false, error: null });
            console.log("Product statistics retrieved successfully", data);
            return data.stats;

        } catch (error) {
            console.error("Error retrieving product statistics:", error);
            set({ loading: false, error: error.message });
            toast.error("Failed to retrieve product statistics");
            return null;
        }
    },

    // Clear selected product
    clearSelectedProduct: () => set({ selectedProduct: null }),

    // Clear products
    clearProducts: () => set({ products: [] }),

    // Clear error
    clearError: () => set({ error: null })
}));