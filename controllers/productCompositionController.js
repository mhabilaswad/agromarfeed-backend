const ProductComposition = require('../models/product/ProductComposition');

exports.createProductComposition = async (req, res) => {
  try {
    const productComposition = new ProductComposition(req.body);
    await productComposition.save();
    res.status(201).json(productComposition);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};