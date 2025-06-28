const ProductReview = require('../models/product/ProductReview');
const Product = require('../models/product/Product');
const User = require('../models/user/User');
const Order = require('../models/order/Order');
const Store = require('../models/store/Store');

// Middleware: Pastikan user login (jika pakai session)
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Login terlebih dahulu.' });
};

// Helper untuk update rating store
async function updateStoreRating(storeId) {
  const products = await Product.find({ store_id: storeId });
  if (!products.length) {
    await Store.findByIdAndUpdate(storeId, { rating: 0 });
    return;
  }
  
  // Filter produk yang sudah direview (rating > 0)
  const reviewedProducts = products.filter(p => p.rating > 0);
  
  if (reviewedProducts.length === 0) {
    await Store.findByIdAndUpdate(storeId, { rating: 0 });
    return;
  }
  
  const avgRating = reviewedProducts.reduce((sum, p) => sum + p.rating, 0) / reviewedProducts.length;
  await Store.findByIdAndUpdate(storeId, { rating: parseFloat(avgRating.toFixed(1)) });
}

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

    const updatedProduct = await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(avgRating.toFixed(1)), // Simpan 1 angka di belakang koma
    }, { new: true });

    // Update rating store setelah rating produk berubah
    if (updatedProduct) {
      await updateStoreRating(updatedProduct.store_id);
    }
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

    // Validasi gambar base64 (opsional)
    if (gambar && !gambar.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Format gambar tidak valid.' });
    }

    const productExists = await Product.findById(product_id);
    if (!productExists) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    // CEK: User pernah membeli produk ini dan status ordernya delivered
    const deliveredOrder = await Order.findOne({
      user_id,
      status: 'delivered',
      'order_item.product_id': product_id
    });

    if (!deliveredOrder) {
      return res.status(403).json({ message: 'Kamu hanya bisa review produk yang sudah kamu terima.' });
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

// Ambil semua review untuk user tertentu
const getReviewsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const reviews = await ProductReview.find({ user_id }).select('product_id');
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Gagal mengambil review user:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Update review
const updateReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { rating, ulasan, gambar } = req.body;
    const user_id = req.user?._id || req.body.user_id;

    // Validasi input
    if (!rating || !ulasan) {
      return res.status(400).json({ message: 'Rating dan ulasan wajib diisi.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating harus antara 1 hingga 5.' });
    }

    if (ulasan.length > 1000) {
      return res.status(400).json({ message: 'Ulasan terlalu panjang (maksimal 1000 karakter).' });
    }

    // Validasi gambar base64 (opsional)
    if (gambar && !gambar.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Format gambar tidak valid.' });
    }

    const existingReview = await ProductReview.findById(review_id);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review tidak ditemukan.' });
    }

    // Pastikan user yang update adalah pemilik review
    if (existingReview.user_id.toString() !== user_id.toString()) {
      return res.status(403).json({ message: 'Kamu tidak memiliki akses untuk mengubah review ini.' });
    }

    const updatedReview = await ProductReview.findByIdAndUpdate(
      review_id,
      {
        rating,
        ulasan,
        ...(gambar && { gambar }),
      },
      { new: true }
    );

    // Update rating produk dan store
    await updateProductAverageRating(existingReview.product_id);

    res.status(200).json({ message: 'Review berhasil diupdate', review: updatedReview });
  } catch (error) {
    console.error('Gagal update review:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Hapus review
const deleteReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const user_id = req.user?._id || req.body.user_id;

    const existingReview = await ProductReview.findById(review_id);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review tidak ditemukan.' });
    }

    // Pastikan user yang hapus adalah pemilik review
    if (existingReview.user_id.toString() !== user_id.toString()) {
      return res.status(403).json({ message: 'Kamu tidak memiliki akses untuk menghapus review ini.' });
    }

    const product_id = existingReview.product_id;
    await ProductReview.findByIdAndDelete(review_id);

    // Update rating produk dan store
    await updateProductAverageRating(product_id);

    res.status(200).json({ message: 'Review berhasil dihapus' });
  } catch (error) {
    console.error('Gagal hapus review:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = {
  ensureAuthenticated,
  createReview,
  getReviewsByProduct,
  getReviewsByUser,
  updateReview,
  deleteReview,
};