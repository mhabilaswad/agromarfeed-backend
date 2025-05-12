const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

router.post('/', OrderController.createOrder); // endpoint: /api/orders

module.exports = router;
