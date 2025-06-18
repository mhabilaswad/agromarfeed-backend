const User = require('../models/user/User');

// GET semua user
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data pengguna' });
  }
};

// POST user baru
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: 'Gagal membuat pengguna' });
  }
};

// PATCH update data user (name, detail, alamat)
exports.updateUserProfile = async (req, res) => {
  const userId = req.params.id;
  const { name, detail, alamat } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

    if (name) user.name = name;
    if (detail) user.detail = detail;
    if (alamat) user.alamat = alamat;

    await user.save();

    res.json({ message: 'Profil pengguna berhasil diperbarui', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui profil pengguna' });
  }
};