const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  categoryOptions: {
    type: String,
    required: true,
  },
  limbahOptions: {
    type: String,
    required: true,
  },
  fisikOptions: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    required: true,
  },
    isBestSeller: {
    type: Boolean,
    default: 0,
  },
    isSpecialOffer: {
    type: Boolean,
    default: 0,
  },
  weights: [weightSchema],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);