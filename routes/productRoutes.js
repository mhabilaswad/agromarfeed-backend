const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

router.post('/', ProductController.createProduct);

// GET semua artikel: /api/artikels
router.get('/', ProductController.getAllProduct);

// GET artikel berdasarkan ID: /api/artikels/:id
router.get('/:id', ProductController.getProductById);

// GET produk berdasarkan store ID
router.get('/store/:storeId', ProductController.getProductsByStoreId);

// UPDATE produk berdasarkan ID
router.put('/:id', ProductController.updateProduct);

// DELETE produk berdasarkan ID
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;