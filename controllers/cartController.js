const Cart = require('../models/cart/Cart'); // Path disesuaikan
const Product = require('../models/product/Product'); // Untuk ambil info harga jika perlu

// ✅ Tambah item ke keranjang
exports.addToCart = async (req, res) => {
  try {
    const user_id = req.user?._id || req.body.user_id;
    const { product_id, jumlah, weight_id, weight_value, harga_satuan } = req.body;

    if (!user_id || !product_id || !jumlah) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    const finalHargaSatuan = harga_satuan || product.price;
    const subtotal = jumlah * finalHargaSatuan;

    let cart = await Cart.findOne({ user_id });

    // Jika user belum punya keranjang
    if (!cart) {
      cart = await Cart.create({
        user_id,
        cart_item: [{ product_id, jumlah, harga_satuan: finalHargaSatuan, subtotal, weight_id, weight_value }],
      });
    } else {
      // Jika item sudah ada, update jumlahnya
      const existingItem = cart.cart_item.find(item => item.product_id.toString() === product_id && item.weight_id === weight_id);
      if (existingItem) {
        existingItem.jumlah += jumlah;
        existingItem.subtotal = existingItem.jumlah * finalHargaSatuan;
      } else {
        cart.cart_item.push({ product_id, jumlah, harga_satuan: finalHargaSatuan, subtotal, weight_id, weight_value });
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
      .populate('cart_item.product_id', 'name imageUrl price stock store_id')
      .sort({ updatedAt: -1 });

    // Selalu return { cart_item: [...] }
    if (!cart || cart.cart_item.length === 0) {
      return res.status(200).json({ cart_item: [] });
    }

    res.status(200).json({ cart_item: cart.cart_item });
  } catch (error) {
    console.error('Gagal ambil keranjang:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Update quantity item di keranjang
exports.updateCartItem = async (req, res) => {
  try {
    const user_id = req.user?._id || req.body.user_id;
    const { product_id, jumlah } = req.body;

    if (!user_id || !product_id || jumlah === undefined) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res.status(404).json({ message: 'Keranjang tidak ditemukan' });
    }

    const item = cart.cart_item.find(item => item.product_id.toString() === product_id);
    if (!item) {
      return res.status(404).json({ message: 'Item tidak ditemukan di keranjang' });
    }

    if (jumlah <= 0) {
      // Hapus item jika jumlah 0 atau negatif
      cart.cart_item = cart.cart_item.filter(item => item.product_id.toString() !== product_id);
    } else {
      // Update jumlah
      item.jumlah = jumlah;
      item.subtotal = jumlah * item.harga_satuan;
    }

    await cart.save();
    res.status(200).json({ message: 'Keranjang berhasil diupdate', cart });
  } catch (error) {
    console.error('Gagal update keranjang:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Hapus item dari keranjang
exports.removeFromCart = async (req, res) => {
  try {
    // Handle both route formats: /remove/:product_id and /remove/:user_id/:product_id
    let user_id, product_id;
    
    if (req.params.user_id && req.params.product_id) {
      // Route: /remove/:user_id/:product_id
      user_id = req.params.user_id;
      product_id = req.params.product_id;
    } else {
      // Route: /remove/:product_id (user_id in body)
      user_id = req.user?._id || req.body.user_id;
      product_id = req.params.product_id;
    }

    console.log('Remove from cart - user_id:', user_id, 'product_id:', product_id);

    if (!user_id) {
      return res.status(400).json({ message: 'User ID tidak ditemukan' });
    }

    if (!product_id) {
      return res.status(400).json({ message: 'Product ID tidak ditemukan' });
    }

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res.status(404).json({ message: 'Keranjang tidak ditemukan' });
    }

    console.log('Cart items before removal:', cart.cart_item.length);

    const initialLength = cart.cart_item.length;
    
    // Filter out the item with matching product_id
    cart.cart_item = cart.cart_item.filter(item => {
      const itemProductId = item.product_id.toString();
      const shouldKeep = itemProductId !== product_id;
      console.log(`Comparing: ${itemProductId} vs ${product_id} = ${shouldKeep ? 'keep' : 'remove'}`);
      return shouldKeep;
    });

    console.log('Cart items after removal:', cart.cart_item.length);

    // Jika tidak ada item yang dihapus, kembalikan error
    if (cart.cart_item.length === initialLength) {
      return res.status(404).json({ 
        message: 'Item tidak ditemukan di keranjang',
        searchedProductId: product_id
      });
    }

    await cart.save();

    res.status(200).json({ 
      message: 'Item berhasil dihapus dari keranjang', 
      removedProductId: product_id
    });
  } catch (error) {
    console.error('Gagal hapus item:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ✅ Kosongkan keranjang
exports.clearCart = async (req, res) => {
  try {
    const user_id = req.user?._id || req.params.user_id;

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res.status(404).json({ message: 'Keranjang tidak ditemukan' });
    }

    cart.cart_item = [];
    await cart.save();

    res.status(200).json({ message: 'Keranjang berhasil dikosongkan', cart });
  } catch (error) {
    console.error('Gagal kosongkan keranjang:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
