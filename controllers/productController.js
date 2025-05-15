const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET Semua Artikel
exports.getAllProduct = async (req, res) => {
  try {
    const product = await Product.find();
    res.status(200).json(prodcuts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Artikel by ID
exports.getArtikelById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};