// controller to add products 
const cloudinary = require('../services/cloudinary');
const Product = require('../models/product');

const addproduct = async (req, res) => {
    try {
        console.log('Adding product with data:', req.body);
        console.log('Files:', req.files);

        // Destructure all fields you want to save
        const {
            name,
            description,
            price,
            category,
            brand,
            stock,
            dimensions,
            isHot,
            isTrending,
            isNew,
            isFeatured,
            status,
            sku,
            tags,
            originalPrice,
            discount
        } = req.body;

        // Main image
        let imageUrl = '';
        if (req.files && req.files.image) {
            const imageFile = req.files.image;
            const uploadRes = await cloudinary.uploader.upload_stream(
                { folder: 'products' },
                (error, result) => {
                    if (error) throw error;
                    imageUrl = result.secure_url;
                }
            );
            uploadRes.end(imageFile.data);
        }

        // Multiple images
        let imagesUrls = [];
        if (req.files && req.files.images) {
            let imagesArray = Array.isArray(req.files.images)
                ? req.files.images
                : [req.files.images];
            for (let i = 0; i < imagesArray.length; i++) {
                const file = imagesArray[i];
                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: 'products' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    ).end(file.data);
                });
                imagesUrls.push({
                    url: result.secure_url,
                    name: file.name,
                    isPrimary: i === 0 // first image is primary
                });
            }
        }
        // Create a new product instance with all fields
        const newProduct = await Product.create({
            name,
            description,
            price,
            category,
            brand,
            stock,
            dimensions,
            isHot,
            isTrending,
            isNew,
            isFeatured,
            status,
            sku,
            image: imageUrl,
            images: imagesUrls,
            tags: JSON.parse(tags || '[]'),
            originalPrice,
            discount
        });



        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
// controller to get all products
const getallproducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ message: 'Products retrieved successfully', products });
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


// Add these functions to your existing product controller

// Get single product by ID
async function getProductById(req, res) {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product retrieved successfully",
            product: product
        });
    } catch (error) {
        console.error("Error getting product by ID:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// Get single product by SKU
async function getProductBySku(req, res) {
    try {
        const { sku } = req.params;

        const product = await Product.findOne({ sku: sku });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product retrieved successfully",
            product: product
        });
    } catch (error) {
        console.error("Error getting product by SKU:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// Get products by category
async function getProductsByCategory(req, res) {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10, sort = 'createdAt' } = req.query;

        const skip = (page - 1) * limit;

        const products = await Product.find({ category: category })
            .sort({ [sort]: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalCount = await Product.countDocuments({ category: category });

        res.json({
            success: true,
            message: "Products retrieved successfully",
            products: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasNext: skip + products.length < totalCount,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error("Error getting products by category:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// Search products
async function searchProducts(req, res) {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            brand,
            isHot,
            isTrending,
            isNew,
            isFeatured,
            inStock,
            page = 1,
            limit = 10,
            sort = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        let query = {};

        // Text search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Category filter
        if (category && category !== 'all') {
            query.category = category;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Brand filter
        if (brand) {
            query.brand = brand;
        }

        // Status filters
        if (isHot === 'true') query.isHot = true;
        if (isTrending === 'true') query.isTrending = true;
        if (isNew === 'true') query.isNew = true;
        if (isFeatured === 'true') query.isFeatured = true;

        // Stock filter
        if (inStock === 'true') {
            query.stock = { $gt: 0 };
            query.status = 'active';
        }

        const skip = (page - 1) * limit;
        const sortObj = {};
        sortObj[sort] = sortOrder === 'desc' ? -1 : 1;

        const products = await Product.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        const totalCount = await Product.countDocuments(query);

        res.json({
            success: true,
            message: "Products search completed",
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasNext: skip + products.length < totalCount,
                hasPrev: page > 1
            },
            filters: {
                search,
                category,
                minPrice,
                maxPrice,
                brand,
                isHot,
                isTrending,
                isNew,
                isFeatured,
                inStock
            }
        });
    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// Get featured products
async function getFeaturedProducts(req, res) {
    try {
        const { limit = 8 } = req.query;

        const products = await Product.find({
            isFeatured: true,
            status: 'active',
            stock: { $gt: 0 }
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            message: "Featured products retrieved successfully",
            products: products,
            count: products.length
        });
    } catch (error) {
        console.error("Error getting featured products:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// Get trending products
async function getTrendingProducts(req, res) {
    try {
        const { limit = 8 } = req.query;

        const products = await Product.find({
            isTrending: true,
            status: 'active',
            stock: { $gt: 0 }
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            message: "Trending products retrieved successfully",
            products: products,
            count: products.length
        });
    } catch (error) {
        console.error("Error getting trending products:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// Get new products
async function getNewProducts(req, res) {
    try {
        const { limit = 8 } = req.query;

        const products = await Product.find({
            isNew: true,
            status: 'active',
            stock: { $gt: 0 }
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            message: "New products retrieved successfully",
            products: products,
            count: products.length
        });
    } catch (error) {
        console.error("Error getting new products:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// Get hot products
async function getHotProducts(req, res) {
    try {
        const { limit = 8 } = req.query;

        const products = await Product.find({
            isHot: true,
            status: 'active',
            stock: { $gt: 0 }
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            message: "Hot products retrieved successfully",
            products: products,
            count: products.length
        });
    } catch (error) {
        console.error("Error getting hot products:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// Get product statistics
async function getProductStats(req, res) {
    try {
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ status: 'active' });
        const outOfStockProducts = await Product.countDocuments({ stock: { $lte: 0 } });
        const lowStockProducts = await Product.countDocuments({
            stock: { $gt: 0, $lte: 10 }
        });
        const featuredProducts = await Product.countDocuments({ isFeatured: true });
        const trendingProducts = await Product.countDocuments({ isTrending: true });

        // Get category distribution
        const categoryStats = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    averagePrice: { $avg: '$price' },
                    totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get price range statistics
        const priceStats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    totalInventoryValue: { $sum: { $multiply: ['$price', '$stock'] } }
                }
            }
        ]);

        res.json({
            success: true,
            message: "Product statistics retrieved successfully",
            stats: {
                totalProducts,
                activeProducts,
                outOfStockProducts,
                lowStockProducts,
                featuredProducts,
                trendingProducts,
                categoryDistribution: categoryStats,
                priceStatistics: priceStats[0] || {
                    avgPrice: 0,
                    minPrice: 0,
                    maxPrice: 0,
                    totalInventoryValue: 0
                }
            }
        });
    } catch (error) {
        console.error("Error getting product stats:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// Update product
async function updateProduct(req, res) {
    try {
        const { productId } = req.params;
        const existing = await Product.findById(productId);
        if (!existing) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Parse possible JSON fields
        let tagsParsed = existing.tags;
        if (req.body.tags) {
            try { tagsParsed = JSON.parse(req.body.tags); } catch { tagsParsed = existing.tags; }
        }

        // Update basic fields
        const fields = [
            'name', 'description', 'price', 'category', 'brand', 'stock', 'dimensions', 'isHot',
            'isTrending', 'isNew', 'isFeatured', 'status', 'sku', 'originalPrice', 'discount', 'shortDescription', 'weight'
        ];
        fields.forEach(f => {
            if (req.body[f] !== undefined) existing[f] = req.body[f];
        });
        existing.tags = tagsParsed;

        // Handle new images (optional)
        if (req.files) {
            // Replace main image if provided
            if (req.files.image) {
                const imageFile = req.files.image;
                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: 'products' },
                        (error, result) => error ? reject(error) : resolve(result)
                    ).end(imageFile.data);
                });
                existing.image = result.secure_url;
            }
            // Append additional gallery images
            if (req.files.images) {
                const imagesArray = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
                for (let i = 0; i < imagesArray.length; i++) {
                    const file = imagesArray[i];
                    const result = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            { folder: 'products' },
                            (error, result) => error ? reject(error) : resolve(result)
                        ).end(file.data);
                    });
                    existing.images.push({
                        url: result.secure_url,
                        name: file.name,
                        isPrimary: false
                    });
                }
            }
        }

        await existing.save();
        res.json({ success: true, message: "Product updated", product: existing });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function deleteProduct(req, res) {
    try {
        const { productId } = req.params;
        const deleted = await Product.findByIdAndDelete(productId);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, message: "Product deleted", productId });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Update the module.exports to include the new functions
module.exports = {
    addproduct,
    getallproducts,
    getProductById,
    getProductBySku,
    getProductsByCategory,
    searchProducts,
    getFeaturedProducts,
    getTrendingProducts,
    getNewProducts,
    getHotProducts,
    getProductStats,
    updateProduct,
    deleteProduct
};
