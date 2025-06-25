const Product = require('../models/product/Product');
const Store = require('../models/store/Store');

// Helper untuk update rating store
async function updateStoreRating(storeId) {
  const products = await Product.find({ store_id: storeId });
  if (!products.length) {
    await Store.findByIdAndUpdate(storeId, { rating: 0 });
    return;
  }
  const avgRating = products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length;
  await Store.findByIdAndUpdate(storeId, { rating: avgRating });
}

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    await updateStoreRating(product.store_id);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET Semua produk
exports.getAllProduct = async (req, res) => {
  try {
    const product = await Product.find();
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Produk by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Produk by Store ID
exports.getProductsByStoreId = async (req, res) => {
  try {
    const products = await Product.find({ store_id: req.params.storeId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Produk by ID
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    await updateStoreRating(product.store_id);
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE Produk by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    await updateStoreRating(product.store_id);
    res.status(200).json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};