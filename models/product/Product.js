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
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store', // asumsi nama model user kamu adalah 'Store'
    required: true
  },
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
  weights: [weightSchema],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);