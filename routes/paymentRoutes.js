const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create payment token
router.post('/create', paymentController.createPayment);

// Handle payment notification from Midtrans
router.post('/notification', paymentController.paymentNotification);

// Check payment status
router.get('/status/:orderId', paymentController.checkPaymentStatus);

// Cancel payment
router.post('/cancel/:orderId', paymentController.cancelPayment);

// Get client key for frontend
router.get('/client-key', paymentController.getClientKey);

module.exports = router; 