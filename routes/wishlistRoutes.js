const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// ✅ Add item to wishlist
router.post('/add', wishlistController.addToWishlist);

// ✅ Get user's wishlist
router.get('/user/:user_id', wishlistController.getWishlistByUser);

// ✅ Remove item from wishlist
router.delete('/remove/:product_id', wishlistController.removeFromWishlist);

// ✅ Clear wishlist
router.delete('/clear/:user_id', wishlistController.clearWishlist);

// ✅ Check if product is in wishlist
router.get('/check/:user_id/:product_id', wishlistController.checkWishlistItem);

module.exports = router; 