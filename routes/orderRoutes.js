const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// ✅ Create order from cart
router.post('/create', orderController.createOrder);

// ✅ Initiate payment
router.post('/:order_id/payment', orderController.initiatePayment);

// ✅ Get user's orders
router.get('/user/:user_id', orderController.getOrdersByUser);

// ✅ Get store's orders
router.get('/store/:store_id', orderController.getOrdersByStore);

// ✅ Get order by ID
router.get('/:order_id', orderController.getOrderById);

// ✅ Update order status (for store owners)
router.put('/:order_id/status', orderController.updateOrderStatus);

// ✅ Cancel order
router.put('/:order_id/cancel', orderController.cancelOrder);

module.exports = router;
