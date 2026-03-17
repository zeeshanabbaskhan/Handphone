const express = require('express');

const router = express.Router();
const { checkauth } = require("../middlewares/checkauth")
const { addproduct,
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
} = require("../controllers/product")



router.post("/addproduct", checkauth, addproduct)
router.get("/getallproducts", getallproducts)


// New routes for customer-side functionality
router.get('/stats', getProductStats);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/new', getNewProducts);
router.get('/hot', getHotProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/sku/:sku', getProductBySku);
router.get('/:productId', getProductById);
router.put("/:productId", checkauth, updateProduct);
router.delete("/:productId", checkauth, deleteProduct);

module.exports = router;






