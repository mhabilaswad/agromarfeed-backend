const mongoose = require('mongoose');

const konsultanSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true
    },
    profesi: {
        type: String,
        required: true
    },
    jadwal: [{
        jam_mulai: String,
        jam_berakhir: String,
    },],
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    rating:{
        type: Number,
        required: true,
    },
    jumlah_penanganan:{
        type: Number,
        required: true,
    },
    aktif: {
        type: Boolean,
        default: true
    },
    jenis_kelamin:{
        type: String,
        default: true
    }
}, { timestamps: true });
module.exports = mongoose.model('Konsultan', konsultanSchema);