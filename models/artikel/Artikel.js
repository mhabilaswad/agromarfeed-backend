const mongoose = require('mongoose');

// Definisikan skema untuk Artikel
const artikelSchema = new mongoose.Schema({
  judul: {
    type: String,
    required: true,  // Judul wajib ada
  },
  konten: {
    type: String,
    required: true,  // Konten wajib ada
  },
  tanggal_publikasi: {
    type: Date,
    default: Date.now,  // Menggunakan tanggal saat ini jika tidak diatur
  },
  penulis: [
    {
      nama: { type: String, required: true },
      avatar: { type: String, required: true },
      role: { type: String },
    }],
  gambar_sampul: {
    type: String,  // Menyimpan URL atau path gambar sampul
    required: true,  // Gambar sampul wajib ada
  },
  view_count: {
    type: Number,
    default: 0,  // Default view_count adalah 0
  },
  kategori: {
    type: String,
    required: true,  // Kategori wajib ada
  }
}, { timestamps: true });  // Mencatat waktu pembuatan dan update secara otomatis

// Membuat model berdasarkan schema
module.exports = mongoose.model('Artikel', artikelSchema);