const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/productReviewController');

// POST buat review
router.post('/', reviewController.createReview);

// GET semua review untuk 1 produk
router.get('/:product_id', reviewController.getReviewsByProduct);

// GET semua review untuk 1 user
router.get('/user/:user_id', reviewController.getReviewsByUser);

module.exports = router;