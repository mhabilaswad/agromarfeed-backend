const ProductReview = require('../models/product/ProductReview');
const Product = require('../models/product/Product');
const User = require('../models/user/User');

// Middleware: Pastikan user login (jika pakai session)
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Login terlebih dahulu.' });
};

// Fungsi untuk update rating rata-rata produk
const updateProductAverageRating = async (productId) => {
  try {
    const reviews = await ProductReview.find({ product_id: productId });

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, { rating: 0 });
      return;
    }

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avgRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(avgRating.toFixed(1)), // Simpan 1 angka di belakang koma
    });
  } catch (error) {
    console.error('Gagal update rata-rata rating:', error);
  }
};

// Buat review baru
const createReview = async (req, res) => {
  try {
    const { product_id, rating, ulasan, gambar } = req.body;
    const user_id = req.user?._id || req.body.user_id;

    // Validasi input
    if (!product_id || !rating || !ulasan || !user_id) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating harus antara 1 hingga 5.' });
    }

    if (ulasan.length > 1000) {
      return res.status(400).json({ message: 'Ulasan terlalu panjang (maksimal 1000 karakter).' });
    }

    const productExists = await Product.findById(product_id);
    if (!productExists) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    const existingReview = await ProductReview.findOne({ product_id, user_id });
    if (existingReview) {
      return res.status(400).json({ message: 'Kamu sudah memberikan ulasan untuk produk ini.' });
    }

    const newReview = await ProductReview.create({
      product_id,
      user_id,
      rating,
      ulasan,
      ...(gambar && { gambar }),
    });

    await updateProductAverageRating(product_id);

    res.status(201).json({ message: 'Review berhasil ditambahkan', review: newReview });
  } catch (error) {
    console.error('Gagal membuat review:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Ambil semua review untuk produk tertentu
const getReviewsByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const reviews = await ProductReview.find({ product_id })
      .populate('user_id', 'name') // Tampilkan nama user
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Gagal mengambil review:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = {
  ensureAuthenticated,
  createReview,
  getReviewsByProduct,
};