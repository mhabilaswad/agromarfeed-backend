const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/productReviewController');

// POST buat review
router.post('/', reviewController.createReview);

// GET semua review untuk 1 user
router.get('/user/:user_id', reviewController.getReviewsByUser);

// PUT update review
router.put('/:review_id', reviewController.updateReview);

// DELETE hapus review
router.delete('/:review_id', reviewController.deleteReview);

// GET semua review untuk 1 produk (harus di akhir agar tidak konflik dengan review_id)
router.get('/product/:product_id', reviewController.getReviewsByProduct);

module.exports = router;