const express = require('express');
const router = express.Router();
const ProductCompositionController = require('../controllers/productCompositionController');

router.post('/', ProductCompositionController.createProductComposition);

module.exports = router;