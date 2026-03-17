"use client"
import React, { useState, useEffect } from 'react';
import {
    Package,
    Users,
    DollarSign,
    TrendingUp,
    ShoppingCart,
    Search,
    Menu,
    X,
    Plus,
    Filter,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    Upload,
    Star,
    AlertTriangle,
    CheckCircle,
    Clock,
    Grid,
    List,
    SortDesc,
    Download,
    Flame,
    Zap,
    Award,
    ShoppingBag,
    ImageIcon,
    Save,
    Percent,
    Tag,
    FileText
} from 'lucide-react';
import Adminsidebar from '@/components/Adminsidebar';
import { userauthstore } from '@/Store/UserAuthStore';
import { ProductStore } from '@/Store/ProductStore';
import axios from 'axios';
import axiosInstance from '@/Store/AxiosInstance';
import ProtectedRoute from '@/components/Protectedroute';

const AdminProductPage = () => {

    const { opensidebar, setOpenSidebar } = userauthstore();
    const { addproduct, getallproducts, products } = ProductStore();
    // const [opensidebar, setOpenSidebar] = useState(false);
    // const [sidebarOpen, setSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [count, setcount] = useState(0)
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewProduct, setViewProduct] = useState(null);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/products";

    // Add Product Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: '',
        price: '',
        originalPrice: '',
        discount: '',
        stock: '',
        description: '',
        shortDescription: '',
        sku: '',
        brand: '',
        weight: '',
        dimensions: '',
        isHot: false,
        isTrending: false,
        isNew: false,
        isFeatured: false,
        tags: [],
        images: [],
        specifications: [{ key: '', value: '' }]
    });

    const [dragActive, setDragActive] = useState(false);
    const [currentTag, setCurrentTag] = useState('');

    // Categories list
    const categoryOptions = [
        'Computer',
        'Laptop',
        'Smartphone',
        'Smart Watch',
        'Earbuds',
        'Desktop',
        'TV',
        'Tablet',
       
    ];

    // Mock data

    useEffect(() => {
        // Fetch all products on component mount
        const fetchProducts = async () => {
            await getallproducts();
        };
        fetchProducts();
    }, [getallproducts, count]);



    const categories = ['all', 'Electronics', 'Wearables', 'Accessories', 'Office'];

    // Helper functions
    const generateSKU = (name, category) => {
        const nameCode = name.substring(0, 3).toUpperCase();
        const categoryCode = category.substring(0, 2).toUpperCase();
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${nameCode}-${categoryCode}-${randomNum}`;
    };

    const calculateDiscountedPrice = (originalPrice, discount) => {
        if (!originalPrice || !discount) return originalPrice;
        return (originalPrice - (originalPrice * discount / 100)).toFixed(2);
    };

    // Image handling
    const handleImageUpload = (files) => {
        if (newProduct.images.length + files.length > 7) {
            alert('Maximum 7 images allowed');
            return;
        }

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                setNewProduct(prev => ({
                    ...prev,
                    images: [...prev.images, {
                        id: Date.now() + Math.random(),
                        file, // store the File object
                        url: URL.createObjectURL(file), // for preview
                        name: file.name,
                        isPrimary: prev.images.length === 0
                    }]
                }));
            }
        });
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files);
        }
    };

    // Tag handling
    const addTag = () => {
        if (currentTag.trim() && !newProduct.tags.includes(currentTag.trim())) {
            setNewProduct(prev => ({
                ...prev,
                tags: [...prev.tags, currentTag.trim()]
            }));
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setNewProduct(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setNewProduct({
            name: '', category: '', price: '', originalPrice: '', discount: '', stock: '', description: '',
            shortDescription: '', sku: '', brand: '', weight: '', dimensions: '',
            isHot: false, isTrending: false, isNew: false, isFeatured: false, tags: [], images: [], specifications: [{ key: '', value: '' }]
        });
        setShowAddModal(true);
    };

    const openEditModal = (product) => {
        setIsEditing(true);
        setEditingId(product._id || product.id);
        setNewProduct(prev => ({
            ...prev,
            name: product.name || '',
            category: product.category || '',
            price: product.price || '',
            originalPrice: product.originalPrice || '',
            discount: product.discount || '',
            stock: product.stock || '',
            description: product.description || '',
            shortDescription: product.shortDescription || '',
            sku: product.sku || '',
            brand: product.brand || '',
            weight: product.weight || '',
            dimensions: product.dimensions || '',
            isHot: product.isHot || false,
            isTrending: product.isTrending || false,
            isNew: product.isNew || false,
            isFeatured: product.isFeatured || false,
            tags: product.tags || [],
            images: product.images?.map((img, i) => ({
                id: i,
                file: null,
                url: img.url || img,
                name: img.name || `image-${i}`,
                isPrimary: img.isPrimary || i === 0
            })) || [],
            specifications: product.specifications || [{ key: '', value: '' }]
        }));
        setShowAddModal(true);
    };

    const handleViewProduct = async (product) => {
        const id = product._id || product.id;
        try {
            const res = await axiosInstance.get(`/product/${id}`);
            if (res.data.success !== false) {
                setViewProduct(res.data.product || res.data);
            }
        } catch (e) {
            console.error("View product failed", e);
        }
    };

    const handleDeleteProduct = async (product) => {
        const id = product._id || product.id;
        if (!confirm("Delete this product?")) return;
        try {
            await axiosInstance.delete(`/product/${id}`)
            await getallproducts();
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    // Modified handleSubmit to handle add vs edit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock) {
            alert('Please fill in all required fields');
            return;
        }
        const finalPrice = newProduct.discount
            ? calculateDiscountedPrice(parseFloat(newProduct.originalPrice || newProduct.price), parseFloat(newProduct.discount))
            : newProduct.price;

        const formData = new FormData();
        newProduct.images.forEach((img, idx) => {
            if (img.file) formData.append('images', img.file);
            if (idx === 0 && img.file) {
                formData.append('image', img.file);
            }
        });
        formData.append('name', newProduct.name);
        formData.append('category', newProduct.category);
        formData.append('price', parseFloat(finalPrice));
        formData.append('originalPrice', newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : '');
        formData.append('discount', newProduct.discount ? parseFloat(newProduct.discount) : '');
        formData.append('stock', parseInt(newProduct.stock));
        formData.append('status', parseInt(newProduct.stock) > 0 ? 'active' : 'out_of_stock');
        formData.append('sku', newProduct.sku || generateSKU(newProduct.name, newProduct.category));
        formData.append('description', newProduct.description);
        formData.append('shortDescription', newProduct.shortDescription);
        formData.append('brand', newProduct.brand);
        formData.append('isHot', newProduct.isHot);
        formData.append('isTrending', newProduct.isTrending);
        formData.append('isNew', newProduct.isNew);
        formData.append('isFeatured', newProduct.isFeatured);
        formData.append('tags', JSON.stringify(newProduct.tags));
        formData.append('weight', newProduct.weight);
        formData.append('dimensions', newProduct.dimensions);
        formData.append('specifications', JSON.stringify(newProduct.specifications));

        try {
            if (isEditing && editingId) {
                await axiosInstance.put(`/product/${editingId}`, formData, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await addproduct(formData);
            }
            setShowAddModal(false);
            await getallproducts();
        } catch (err) {
            console.error("Save product failed", err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'out_of_stock': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'low_stock': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4" />;
            case 'out_of_stock': return <AlertTriangle className="w-4 h-4" />;
            case 'low_stock': return <Clock className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSelectProduct = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(p => p.id));
        }
    };

    const ProductCard = ({ product }) => (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="mt-1 w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                />
                <div className="flex space-x-2 ">
                    <button onClick={() => handleViewProduct(product)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditModal(product)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteProduct(product)} className="p-2 text-slate-300 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="aspect-square bg-slate-700/30 rounded-xl mb-4 overflow-hidden">
                <img
                    src={product.image || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            <div className="space-y-3">
                <div>
                    <h3 className="font-semibold text-white text-lg leading-tight">{product.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">SKU: {product.sku}</p>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-400">${product.price}</span>
                    <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-slate-400 text-sm">{product.rating}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Stock: {product.stock}</span>
                    <span className="text-slate-400 text-sm">{product.sales} sold</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{product.category}</span>
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 ${getStatusColor(product.status)}`}>
                        {getStatusIcon(product.status)}
                        <span className="capitalize">{product.status.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const ProductRow = ({ product }) => (
        <tr className="hover:bg-slate-700/30 transition-colors">
            <td className="px-6 py-4">
                <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                    <img
                        src={product.image || null}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-slate-400 text-sm">SKU: {product.sku}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-slate-300">{product.category}</td>
            <td className="px-6 py-4 text-green-400 font-semibold">${product.price}</td>
            <td className="px-6 py-4 text-slate-300">{product.stock}</td>
            <td className="px-6 py-4">
                <div className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusColor(product.status)}`}>
                    {getStatusIcon(product.status)}
                    <span className="capitalize">{product.status.replace('_', ' ')}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-slate-300">{product.sales}</td>
            <td className="px-6 py-4">
                <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-slate-300">{product.rating}</span>
                </div>
            </td>
            <td className="px-6 py-4 flex">
                <div className="flex  space-x-2">
                    <button onClick={() => handleViewProduct(product)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditModal(product)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteProduct(product)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (

        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
                {/* Sidebar */}
                <Adminsidebar />

                {/* Main Content */}
                <div className="lg:ml-64">
                    {/* Header */}
                    <header className="bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setOpenSidebar(!opensidebar)}
                                    className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                                >
                                    <Menu className="w-5 h-5 text-slate-400" />
                                </button>
                                <h2 className="text-xl font-bold text-white">Products Management</h2>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={openAddModal}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Product</span>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Filters & Search */}
                    <div className="p-6 bg-slate-800/20 backdrop-blur-xl border-b border-slate-700/50">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent w-full sm:w-64"
                                    />
                                </div>

                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category === 'all' ? 'All Categories' : category}
                                        </option>
                                    ))}
                                </select>


                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center bg-slate-700/50 rounded-xl p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>


                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedProducts.length > 0 && (
                            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-between">
                                <span className="text-white font-medium">
                                    {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                                </span>
                                <div className="flex space-x-2">
                                    <button className="px-3 py-1 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm">
                                        Bulk Edit
                                    </button>
                                    <button className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm">
                                        Delete Selected
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Products Content */}
                    <main className="p-6">
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-700/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.length === filteredProducts.length}
                                                    onChange={handleSelectAll}
                                                    className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Sales</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Rating</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {filteredProducts.map((product) => (
                                            <ProductRow key={product.id} product={product} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-400 mb-2">No products found</h3>
                                <p className="text-slate-500">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </main>
                </div>

                {/* Mobile Sidebar Overlay */}
                {opensidebar && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        onClick={() => setOpenSidebar(false)}
                    />
                )}
            </div>




            {
                showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleSubmit}>
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                                    <h3 className="text-xl font-semibold text-white">Add New Product</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Product Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={newProduct.name}
                                                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                placeholder="Enter product name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Category *
                                            </label>
                                            <select
                                                required
                                                value={newProduct.category}
                                                onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            >
                                                <option value="">Select Category</option>
                                                {categoryOptions.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Price *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Original Price (if discounted)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newProduct.originalPrice}
                                                onChange={(e) => setNewProduct(prev => ({ ...prev, originalPrice: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Discount %
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={newProduct.discount}
                                                onChange={(e) => setNewProduct(prev => ({ ...prev, discount: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Stock Quantity *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                required
                                                value={newProduct.stock}
                                                onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Brand
                                            </label>
                                            <input
                                                type="text"
                                                value={newProduct.brand}
                                                onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                placeholder="Brand name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                SKU (auto-generated if empty)
                                            </label>
                                            <input
                                                type="text"
                                                value={newProduct.sku}
                                                onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                placeholder="Auto-generated"
                                            />
                                        </div>
                                    </div>

                                    {/* Product Flags */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-3">
                                            Product Status
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newProduct.isHot}
                                                    onChange={(e) => setNewProduct(prev => ({ ...prev, isHot: e.target.checked }))}
                                                    className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                                                />
                                                <span className="text-slate-300 flex items-center space-x-1">
                                                    <Flame className="w-4 h-4 text-red-500" />
                                                    <span>Hot</span>
                                                </span>
                                            </label>

                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newProduct.isTrending}
                                                    onChange={(e) => setNewProduct(prev => ({ ...prev, isTrending: e.target.checked }))}
                                                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-slate-300 flex items-center space-x-1">
                                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                                    <span>Trending</span>
                                                </span>
                                            </label>

                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newProduct.isNew}
                                                    onChange={(e) => setNewProduct(prev => ({ ...prev, isNew: e.target.checked }))}
                                                    className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
                                                />
                                                <span className="text-slate-300 flex items-center space-x-1">
                                                    <Zap className="w-4 h-4 text-green-500" />
                                                    <span>New</span>
                                                </span>
                                            </label>

                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newProduct.isFeatured}
                                                    onChange={(e) => setNewProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                                    className="w-4 h-4 text-yellow-600 bg-slate-700 border-slate-600 rounded focus:ring-yellow-500"
                                                />
                                                <span className="text-slate-300 flex items-center space-x-1">
                                                    <Award className="w-4 h-4 text-yellow-500" />
                                                    <span>Featured</span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={newProduct.description}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            placeholder="Product description..."
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Tags
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {newProduct.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg text-sm flex items-center space-x-1"
                                                >
                                                    <span>{tag}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="text-purple-400 hover:text-purple-200"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={currentTag}
                                                onChange={(e) => setCurrentTag(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                                className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                placeholder="Add tag and press Enter"
                                            />
                                            <button
                                                type="button"
                                                onClick={addTag}
                                                className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Product Images (Max 7)
                                        </label>
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600 hover:border-slate-500'
                                                }`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                            <p className="text-slate-400 mb-2">Drag & drop images here, or click to select</p>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e.target.files)}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="inline-block px-4 py-2 bg-slate-700/50 text-white rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
                                            >
                                                Select Images
                                            </label>
                                        </div>

                                        {/* Image Preview */}
                                        {newProduct.images.length > 0 && (
                                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                                                {newProduct.images.map((img, index) => (
                                                    <div key={img.url} className="relative group">
                                                        <img
                                                            src={img.url}
                                                            alt={`Product ${index + 1}`}
                                                            className="w-full h-20 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewProduct(prev => ({
                                                                ...prev,
                                                                images: prev.images.filter(i => i.id !== img.id)
                                                            }))}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                        {img.isPrimary && (
                                                            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                                                                Primary
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-end space-x-4 p-6 border-t border-slate-700/50">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Add Product</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {viewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-slate-800/90 border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                            <h3 className="text-xl font-semibold text-white">Product Details</h3>
                            <button onClick={() => setViewProduct(null)} className="p-2 hover:bg-slate-700/50 rounded-lg">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="aspect-square bg-slate-700/30 rounded-xl overflow-hidden">
                                    <img src={viewProduct.image} alt={viewProduct.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-2xl font-bold text-white">{viewProduct.name}</h4>
                                    <p className="text-slate-300 text-sm">{viewProduct.description}</p>
                                    <p className="text-green-400 text-xl font-semibold">${viewProduct.price}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewProduct.tags?.map(t => (
                                            <span key={t} className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-300">{t}</span>
                                        ))}
                                    </div>
                                    <div className="text-slate-400 text-sm space-y-1">
                                        <p>Category: {viewProduct.category}</p>
                                        <p>Brand: {viewProduct.brand || '-'}</p>
                                        <p>SKU: {viewProduct.sku}</p>
                                        <p>Stock: {viewProduct.stock}</p>
                                        <p>Status: {viewProduct.status}</p>
                                    </div>
                                </div>
                            </div>
                            {viewProduct.images?.length > 0 && (
                                <div>
                                    <h5 className="text-slate-300 mb-2 font-medium">Gallery</h5>
                                    <div className="flex flex-wrap gap-3">
                                        {viewProduct.images.map((img, i) => (
                                            <img key={i} src={img.url} className="w-20 h-20 object-cover rounded-lg border border-slate-600" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end p-6 border-t border-slate-700/50">
                            <button
                                onClick={() => { setViewProduct(null); openEditModal(viewProduct); }}
                                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
};

export default AdminProductPage;