const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // asumsi nama model user kamu adalah 'User'
        required: true
    },
    nama: {
        type: String,
        required: true
    },
    nik: {
        type: String,
        required: true
    },
    foto_ktp: {
        type: String,
        required: true
    },
    nama_toko: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    nomor_hp: {
        type: String,
        required: true
    },
    deskripsi: {
        type: String,
        required: true
    },
    alamat: {
        label_alamat: String,
        provinsi: String,
        kabupaten: String,
        kecamatan: String,
        desa: String,
        kode_pos: Number,
        alamat_lengkap: String
    },
    tanggal_dibuat: {
        type: Date,
        default: Date.now
    },
    aktif: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);