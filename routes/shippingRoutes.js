const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

// ✅ Get provinces
router.get('/provinces', shippingController.getProvinces);

// ✅ Get cities by province
router.get('/cities/:province_id', shippingController.getCities);

// ✅ Get available couriers
router.get('/couriers', shippingController.getCouriers);

// ✅ Calculate shipping cost
router.post('/cost', shippingController.calculateShipping);

// ✅ Get shipping cost for cart
router.post('/cart-cost', shippingController.getShippingCostForCart);

router.get('/search-destination', shippingController.searchDestination);
router.get('/calculate', shippingController.calculateShipping);

module.exports = router; 