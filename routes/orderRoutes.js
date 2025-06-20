const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// ✅ Create order from cart
router.post('/create', orderController.createOrder);

// ✅ Initiate payment
router.post('/:order_id/payment', orderController.initiatePayment);

// ✅ Handle payment notification (webhook)
router.post('/payment/notification', orderController.handlePaymentNotification);

// ✅ Get user's orders
router.get('/user/:user_id', orderController.getOrdersByUser);

// ✅ Get order by ID
router.get('/:order_id', orderController.getOrderById);

// ✅ Cancel order
router.put('/:order_id/cancel', orderController.cancelOrder);

module.exports = router;
