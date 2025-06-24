const Konsultan = require('../models/konsultasi/konsultan');

// ✅ Buat konsultan baru
exports.createKonsultan = async (req, res) => {
  try {
    const konsultan = new Konsultan(req.body);
    await konsultan.save();
    res.status(201).json(konsultan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Ambil semua konsultan
exports.getAllKonsultan = async (req, res) => {
  try {
    const konsultanList = await Konsultan.find();
    res.status(200).json(konsultanList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Ambil konsultan berdasarkan ID
exports.getKonsultanById = async (req, res) => {
  try {
    const konsultan = await Konsultan.findById(req.params.id);
    if (!konsultan) return res.status(404).json({ message: 'Konsultan tidak ditemukan' });
    res.status(200).json(konsultan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update konsultan by ID
exports.updateKonsultan = async (req, res) => {
  try {
    const konsultan = await Konsultan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!konsultan) return res.status(404).json({ message: 'Konsultan tidak ditemukan' });
    res.status(200).json(konsultan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Hapus konsultan by ID
exports.deleteKonsultan = async (req, res) => {
  try {
    const konsultan = await Konsultan.findByIdAndDelete(req.params.id);
    if (!konsultan) return res.status(404).json({ message: 'Konsultan tidak ditemukan' });
    res.status(200).json({ message: 'Konsultan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
