const mongoose = require('mongoose');

const productReviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: Number,
  ulasan: String,
  gambar: String,
}, { timestamps: true });

module.exports = mongoose.model('ProductReview', productReviewSchema);