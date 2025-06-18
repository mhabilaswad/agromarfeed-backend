const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware'); // opsional

router.post('/add', protect, cartController.addToCart);
router.get('/:user_id', protect, cartController.getCartByUser);

module.exports = router;