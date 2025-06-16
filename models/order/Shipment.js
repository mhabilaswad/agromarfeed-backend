const mongoose = require('mongoose');

// Definisikan skema untuk shipment
const shipmentSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,  // Menyimpan ObjectId yang menjadi referensi ke model User
        ref: 'Order',  // Referensi ke model User
        required: true,  // user_id wajib ada
    },
    nomor_resi: Number,
    kurir: {
        type: String,
        required: true,  // Status wajib ada
        enum: ['JNE', 'J&T', 'TIKI'],  // Hanya menerima status ini
    },
    status: {
        type: String,
        required: true,  // Status wajib ada
        enum: ['On Delivery', 'Delivered', 'Finish'],  // Hanya menerima status ini
    },
    tanggal_pengiriman: {
        type: Date,
        default: Date.now,  // Default menggunakan waktu saat ini
    },
    estimasi_tiba: {
        type: Date 
    },
    biaya_pengiriman: Number,
}, { timestamps: true });  // Mencatat waktu pembuatan dan update secara otomatis

// Membuat model berdasarkan schema
module.exports = mongoose.model('Shipment', shipmentSchema);