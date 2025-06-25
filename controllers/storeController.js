const Store = require('../models/store/Store');
const User = require('../models/user/User');

// Create a new store
exports.createStore = async (req, res) => {
  try {
    console.log('[STORE] Payload diterima:', req.body);
    const store = new Store(req.body);
    await store.save();
    // Update role user menjadi penjual
    await User.findByIdAndUpdate(req.body.user_id, { role: 'penjual' });
    res.status(201).json(store);
  } catch (error) {
    console.error('[STORE] Error saat createStore:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all stores
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find();
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get store by ID
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store tidak ditemukan' });
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get store by user ID
exports.getStoreByUserId = async (req, res) => {
  try {
    const store = await Store.findOne({ user_id: req.params.userId });
    if (!store) return res.status(404).json({ message: 'Store tidak ditemukan' });
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update store by ID
exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!store) return res.status(404).json({ message: 'Store tidak ditemukan' });
    res.status(200).json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete store by ID
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store tidak ditemukan' });
    res.status(200).json({ message: 'Store berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 