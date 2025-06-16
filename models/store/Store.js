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
    deskripsi: {
        type: String,
        required: true
    },
    alamat: {
        nama: String,
        nomor_hp: String,
        label_alamat: String,
        provinsi: String,
        kabupaten: String,
        kecamatan: String,
        desa: String,
        kode_pos: Number,
        alamat_lengkap: String,
        catatan_kurir: String
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