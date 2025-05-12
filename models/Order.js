const mongoose = require('mongoose');

// Definisikan skema untuk Order
const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,  // Menyimpan ObjectId yang menjadi referensi ke model User
    ref: 'User',  // Referensi ke model User
    required: true,  // user_id wajib ada
  },
  tanggal_order: {
    type: Date,
    default: Date.now,  // Default menggunakan waktu saat ini
  },
  status: {
    type: String,
    required: true,  // Status wajib ada
    enum: ['pending', 'completed', 'cancelled'],  // Hanya menerima status ini
  },
  total_harga: {
    type: Number,
    required: true,  // Total harga wajib ada
  },
  metode_pembayaran: {
    type: String,
    required: true,  // Metode pembayaran wajib ada
  },
  catatan: {
    type: String,
    default: '',  // Jika tidak ada catatan, kosongkan string
  }
}, { timestamps: true });  // Mencatat waktu pembuatan dan update secara otomatis

// Membuat model berdasarkan schema
module.exports = mongoose.model('Order', orderSchema);