const mongoose = require('mongoose');

const productCompositionSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  nutrisi: [
    {
      nama: { type: String, required: false },
      persentase: { type: Number, required: false },
    },
  ],
  manfaat: [
    {
      nama: { type: String, required: false }
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('ProductComposition', productCompositionSchema);