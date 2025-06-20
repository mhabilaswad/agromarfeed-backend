const Order = require('../models/order/Order');
const Cart = require('../models/cart/Cart');
const Product = require('../models/product/Product');
const midtransClient = require('midtrans-client');
const crypto = require('crypto');

// Initialize Midtrans client
const snap = new midtransClient.Snap({
  isProduction: false, // Set to true for production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// ✅ Create order from cart
exports.createOrder = async (req, res) => {
  try {
    const user_id = req.user?._id || req.body.user_id;
    const { shipping_address, ongkir, catatan } = req.body;

    if (!user_id || !shipping_address) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user_id }).populate('cart_item.product_id');
    if (!cart || cart.cart_item.length === 0) {
      return res.status(400).json({ message: 'Keranjang kosong' });
    }

    // Calculate totals
    const total_harga = cart.cart_item.reduce((sum, item) => sum + item.subtotal, 0);
    const total_bayar = total_harga + (ongkir || 0);

    // Create order
    const order = new Order({
      user_id,
      order_item: cart.cart_item.map(item => ({
        product_id: item.product_id._id,
        jumlah: item.jumlah,
        harga_satuan: item.harga_satuan,
        subtotal: item.subtotal
      })),
      total_harga,
      ongkir: ongkir || 0,
      total_bayar,
      metode_pembayaran: 'midtrans',
      shipping_address,
      catatan: catatan || '',
      status: 'pending',
      payment_status: 'pending'
    });

    await order.save();

    // Clear cart after order creation
    cart.cart_item = [];
    await cart.save();

    res.status(201).json({ 
      message: 'Order berhasil dibuat', 
      order,
      payment_url: null // Will be generated when payment is initiated
    });
  } catch (error) {
    console.error('Gagal buat order:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Initiate payment with Midtrans
exports.initiatePayment = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { payment_type } = req.body; // bank_transfer, gopay, etc.

    const order = await Order.findById(order_id).populate('user_id').populate('order_item.product_id');
    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    // Prepare Midtrans transaction details
    const transactionDetails = {
      transaction_details: {
        order_id: `ORDER-${order._id}`,
        gross_amount: order.total_bayar
      },
      customer_details: {
        first_name: order.shipping_address.nama,
        email: order.user_id.email,
        phone: order.shipping_address.telepon,
        billing_address: {
          first_name: order.shipping_address.nama,
          phone: order.shipping_address.telepon,
          address: order.shipping_address.alamat,
          city: order.shipping_address.kota,
          postal_code: order.shipping_address.kode_pos,
          country_code: 'IDN'
        },
        shipping_address: {
          first_name: order.shipping_address.nama,
          phone: order.shipping_address.telepon,
          address: order.shipping_address.alamat,
          city: order.shipping_address.kota,
          postal_code: order.shipping_address.kode_pos,
          country_code: 'IDN'
        }
      },
      item_details: order.order_item.map(item => ({
        id: item.product_id._id.toString(),
        price: item.harga_satuan,
        quantity: item.jumlah,
        name: item.product_id.name
      })),
      enabled_payments: payment_type ? [payment_type] : [
        'credit_card', 'bca_va', 'bni_va', 'bri_va', 'gopay', 'shopeepay'
      ]
    };

    // Create Midtrans transaction
    const transaction = await snap.createTransaction(transactionDetails);

    // Update order with Midtrans info
    order.midtrans_order_id = transactionDetails.transaction_details.order_id;
    order.midtrans_payment_type = payment_type || 'multiple';
    await order.save();

    res.status(200).json({
      message: 'Payment berhasil diinisiasi',
      payment_url: transaction.redirect_url,
      token: transaction.token,
      order_id: order._id
    });
  } catch (error) {
    console.error('Gagal inisiasi payment:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Handle Midtrans notification
exports.handlePaymentNotification = async (req, res) => {
  try {
    const notification = req.body;

    // Verify signature key
    const expectedSignature = crypto
      .createHash('sha512')
      .update(notification.order_id + notification.status_code + notification.gross_amount + process.env.MIDTRANS_SERVER_KEY)
      .digest('hex');

    if (notification.signature_key !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Find order by Midtrans order ID
    const order = await Order.findOne({ midtrans_order_id: notification.order_id });
    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    // Update order status based on payment status
    switch (notification.transaction_status) {
      case 'capture':
      case 'settlement':
        order.payment_status = 'paid';
        order.status = 'processing';
        order.midtrans_transaction_id = notification.transaction_id;
        break;
      case 'pending':
        order.payment_status = 'pending';
        break;
      case 'deny':
      case 'expire':
      case 'cancel':
        order.payment_status = 'failed';
        order.status = 'cancelled';
        break;
    }

    await order.save();

    res.status(200).json({ message: 'Notification processed successfully' });
  } catch (error) {
    console.error('Gagal proses notification:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Get order by user
exports.getOrdersByUser = async (req, res) => {
  try {
    const user_id = req.user?._id || req.params.user_id;

    const orders = await Order.find({ user_id })
      .populate('order_item.product_id', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Gagal ambil orders:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findById(order_id)
      .populate('user_id', 'name email')
      .populate('order_item.product_id', 'name imageUrl price');

    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Gagal ambil order:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const user_id = req.user?._id || req.body.user_id;

    const order = await Order.findOne({ _id: order_id, user_id });
    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order tidak dapat dibatalkan' });
    }

    order.status = 'cancelled';
    order.payment_status = 'cancelled';
    await order.save();

    res.status(200).json({ message: 'Order berhasil dibatalkan', order });
  } catch (error) {
    console.error('Gagal batalkan order:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};