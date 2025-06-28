const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// ✅ Add item to cart
router.post('/add', cartController.addToCart);

// ✅ Get user's cart
router.get('/user/:user_id', cartController.getCartByUser);

// ✅ Update cart item quantity
router.put('/update', cartController.updateCartItem);

// ✅ Remove item from cart (with user_id in URL) - MORE SPECIFIC ROUTE FIRST
router.delete('/remove/:user_id/:product_id', cartController.removeFromCart);

// ✅ Remove item from cart (with user_id in body) - LESS SPECIFIC ROUTE LAST
router.delete('/remove/:product_id', cartController.removeFromCart);

// ✅ Clear cart
router.delete('/clear/:user_id', cartController.clearCart);

module.exports = router;