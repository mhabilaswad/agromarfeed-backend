const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// ✅ Add item to cart
router.post('/add', cartController.addToCart);

// ✅ Get user's cart
router.get('/user/:user_id', cartController.getCartByUser);

// ✅ Update cart item quantity
router.put('/update', cartController.updateCartItem);

// ✅ Remove item from cart
router.delete('/remove/:product_id', cartController.removeFromCart);

// ✅ Clear cart
router.delete('/clear/:user_id', cartController.clearCart);

module.exports = router;