const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

router.post('/', ProductController.createProduct);

// GET semua artikel: /api/artikels
router.get('/', ProductController.getAllProduct);

// GET artikel berdasarkan ID: /api/artikels/:id
router.get('/:id', ProductController.getProductById);

module.exports = router;