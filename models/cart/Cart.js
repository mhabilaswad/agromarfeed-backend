const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // asumsi nama model user kamu adalah 'Store'
    required: true
  },
  cart_item: [
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
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);