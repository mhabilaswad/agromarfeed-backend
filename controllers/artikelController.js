const Artikel = require('../models/Artikel');

exports.createArtikel = async (req, res) => {
  try {
    const artikel = new Artikel(req.body);
    await artikel.save();
    res.status(201).json(artikel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};