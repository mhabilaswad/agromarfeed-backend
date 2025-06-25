const Artikel = require('../models/artikel/Artikel');

exports.createArtikel = async (req, res) => {
  try {
    const artikel = new Artikel(req.body);
    await artikel.save();
    res.status(201).json(artikel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET Semua Artikel
exports.getAllArtikel = async (req, res) => {
  try {
    const artikels = await Artikel.find();
    res.status(200).json(artikels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Artikel by ID
exports.getArtikelById = async (req, res) => {
  try {
    const artikel = await Artikel.findById(req.params.id);
    if (!artikel) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    res.status(200).json(artikel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Artikel by ID
exports.updateArtikel = async (req, res) => {
  try {
    const artikel = await Artikel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!artikel) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    res.status(200).json(artikel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE Artikel by ID
exports.deleteArtikel = async (req, res) => {
  try {
    const artikel = await Artikel.findByIdAndDelete(req.params.id);
    if (!artikel) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    res.status(200).json({ message: 'Artikel berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Artikel by kategori
exports.getArtikelByKategori = async (req, res) => {
  try {
    const kategori = req.params.kategori;
    const artikels = await Artikel.find({ kategori });
    res.status(200).json(artikels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};