const Cart = require('../models/cart/Cart'); // Path disesuaikan
const Product = require('../models/product/Product'); // Untuk ambil info harga jika perlu

// ✅ Tambah item ke keranjang
exports.addToCart = async (req, res) => {
  try {
    const user_id = req.user?._id || req.body.user_id;
    const { product_id, jumlah } = req.body;

    if (!user_id || !product_id || !jumlah) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    const harga_satuan = product.price;
    const subtotal = jumlah * harga_satuan;

    let cart = await Cart.findOne({ user_id });

    // Jika user belum punya keranjang
    if (!cart) {
      cart = await Cart.create({
        user_id,
        cart_item: [{ product_id, jumlah, harga_satuan, subtotal }],
      });
    } else {
      // Jika item sudah ada, update jumlahnya
      const existingItem = cart.cart_item.find(item => item.product_id.toString() === product_id);
      if (existingItem) {
        existingItem.jumlah += jumlah;
        existingItem.subtotal = existingItem.jumlah * harga_satuan;
      } else {
        cart.cart_item.push({ product_id, jumlah, harga_satuan, subtotal });
      }
      await cart.save();
    }

    res.status(200).json({ message: 'Item berhasil ditambahkan ke keranjang', cart });
  } catch (error) {
    console.error('Gagal tambah item:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Ambil isi keranjang user
exports.getCartByUser = async (req, res) => {
  try {
    const user_id = req.user?._id || req.params.user_id;

    const cart = await Cart.findOne({ user_id })
      .populate('cart_item.product_id', 'name imageUrl price') // Menampilkan info produk
      .sort({ updatedAt: -1 });

    if (!cart || cart.cart_item.length === 0) {
      return res.status(200).json({ message: 'Keranjang kosong', items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Gagal ambil keranjang:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
