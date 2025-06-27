const mongoose = require('mongoose');

// Definisikan skema untuk Order
const appointmentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,  // Menyimpan ObjectId yang menjadi referensi ke model User
    ref: 'User',  // Referensi ke model User
    required: true,  // user_id wajib ada
  }, 
  orderId: {
    type: String,
    unique: true,
    required: true,  // Order ID wajib ada untuk tracking
  },
  nama_lengkap: {
    type: String,
  },
  email: {
    type: String,
  },
  no_hp: {
    type: String,
  },
  konsultan_id: {
    type: mongoose.Schema.Types.ObjectId,  // Menyimpan ObjectId yang menjadi referensi ke model User
    ref: 'Konsultan',  // Referensi ke model User
    required: true,  // user_id wajib ada
  },
  tanggal_konsultasi: {
    type: Date,
  },
  jadwal:{
    jam_mulai: String,
    jam_berakhir: String
  },
  total_harga: {
    type: Number,
    required: true,  // Total harga wajib ada
  },
  metode_pembayaran: {
    type: String,
    required: true,  // Metode pembayaran wajib ada
  },
  // Payment information
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'expired'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  midtrans_order_id: String,
  midtrans_payment_type: String,
  midtrans_transaction_id: String,
  payment_url: String,
  snap_redirect_url: String,
  zoom_link: String,
}, { timestamps: true });  // Mencatat waktu pembuatan dan update secara otomatis

// Membuat model berdasarkan schema
module.exports = mongoose.model('Appointment', appointmentSchema);