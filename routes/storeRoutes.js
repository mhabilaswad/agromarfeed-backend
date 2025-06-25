const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Create store
router.post('/', storeController.createStore);
// Get all stores
router.get('/', storeController.getStores);
// Get store by ID
router.get('/:id', storeController.getStoreById);
// Get store by user ID
router.get('/user/:userId', storeController.getStoreByUserId);
// Update store by ID
router.put('/:id', storeController.updateStore);
// Delete store by ID
router.delete('/:id', storeController.deleteStore);

module.exports = router; 