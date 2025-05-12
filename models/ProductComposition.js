const mongoose = require('mongoose');

const productCompositionSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  bahan: {
    type: String,
    required: true,
  },
  sumber_limbah: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('ProductComposition', productCompositionSchema);