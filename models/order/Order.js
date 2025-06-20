const mongoose = require('mongoose');

// Definisikan skema untuk Order
const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,  // Menyimpan ObjectId yang menjadi referensi ke model User
    ref: 'User',  // Referensi ke model User
    required: true,  // user_id wajib ada
  },
  order_item: [
    {
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        jumlah: Number,
        harga_satuan: Number,
        subtotal: Number,
    },
  ],
  tanggal_order: {
    type: Date,
    default: Date.now,  // Default menggunakan waktu saat ini
  },
  status: {
    type: String,
    required: true,  // Status wajib ada
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'],  // Hanya menerima status ini
  },
  total_harga: {
    type: Number,
    required: true,  // Total harga wajib ada
  },
  ongkir: {
    type: Number,
    default: 0,
  },
  total_bayar: {
    type: Number,
    required: true,
  },
  metode_pembayaran: {
    type: String,
    required: true,  // Metode pembayaran wajib ada
  },
  // Shipping information
  shipping_address: {
    nama: String,
    telepon: String,
    alamat: String,
    kota: String,
    kode_pos: String,
    provinsi: String,
  },
  // Payment information
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'expired'],
    default: 'pending'
  },
  midtrans_order_id: String,
  midtrans_payment_type: String,
  midtrans_transaction_id: String,
  catatan: {
    type: String,
    default: '', 
  }
}, { timestamps: true });  // Mencatat waktu pembuatan dan update secara otomatis

// Membuat model berdasarkan schema
module.exports = mongoose.model('Order', orderSchema);