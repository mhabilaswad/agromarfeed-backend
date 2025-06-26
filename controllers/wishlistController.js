const Wishlist = require('../models/user/Wishlist');
const Product = require('../models/product/Product');

// ✅ Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const user_id = req.user?._id || req.body.user_id;
    const { product_id } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    let wishlist = await Wishlist.findOne({ user_id });

    // If user doesn't have a wishlist yet
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user_id,
        wishlist_item: [{ product_id }],
      });
    } else {
      // Check if product already exists in wishlist
      const existingItem = wishlist.wishlist_item.find(
        item => item.product_id.toString() === product_id
      );
      
      if (existingItem) {
        return res.status(400).json({ message: 'Produk sudah ada di wishlist' });
      }
      
      wishlist.wishlist_item.push({ product_id });
      await wishlist.save();
    }

    res.status(200).json({ message: 'Item berhasil ditambahkan ke wishlist', wishlist });
  } catch (error) {
    console.error('Gagal tambah item ke wishlist:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Get user's wishlist
exports.getWishlistByUser = async (req, res) => {
  try {
    const user_id = req.user?._id || req.params.user_id;

    const wishlist = await Wishlist.findOne({ user_id })
      .populate('wishlist_item.product_id', 'name imageUrl price stock store_id categoryOptions rating')
      .sort({ updatedAt: -1 });

    // Always return { wishlist_item: [...] }
    if (!wishlist || wishlist.wishlist_item.length === 0) {
      return res.status(200).json({ wishlist_item: [] });
    }

    res.status(200).json({ wishlist_item: wishlist.wishlist_item });
  } catch (error) {
    console.error('Gagal ambil wishlist:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const user_id = req.user?._id || req.params.user_id;
    const { product_id } = req.params;

    const wishlist = await Wishlist.findOne({ user_id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist tidak ditemukan' });
    }

    wishlist.wishlist_item = wishlist.wishlist_item.filter(
      item => item.product_id.toString() !== product_id
    );
    await wishlist.save();

    res.status(200).json({ message: 'Item berhasil dihapus dari wishlist', wishlist });
  } catch (error) {
    console.error('Gagal hapus item dari wishlist:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const user_id = req.user?._id || req.params.user_id;

    const wishlist = await Wishlist.findOne({ user_id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist tidak ditemukan' });
    }

    wishlist.wishlist_item = [];
    await wishlist.save();

    res.status(200).json({ message: 'Wishlist berhasil dikosongkan', wishlist });
  } catch (error) {
    console.error('Gagal kosongkan wishlist:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Check if product is in wishlist
exports.checkWishlistItem = async (req, res) => {
  try {
    const user_id = req.user?._id || req.params.user_id;
    const { product_id } = req.params;

    const wishlist = await Wishlist.findOne({ user_id });
    if (!wishlist) {
      return res.status(200).json({ isInWishlist: false });
    }

    const isInWishlist = wishlist.wishlist_item.some(
      item => item.product_id.toString() === product_id
    );

    res.status(200).json({ isInWishlist });
  } catch (error) {
    console.error('Gagal cek wishlist item:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}; 