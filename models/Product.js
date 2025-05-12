const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
  },
  deskripsi: {
    type: String,
    required: true,
  },
  harga: {
    type: Number,
    required: true,
  },
  stok: {
    type: Number,
    required: true,
  },
  gambar: {
    type: String,
  },
  tersedia: {
    type: Boolean,
    default: true,
  },
  tanggal_dibuat: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);