const User = require('../models/user/User');
const path = require('path');
const fs = require('fs');

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

// PATCH update data user (name, detail, alamat, profile_picture)
exports.updateUserProfile = async (req, res) => {
  const userId = req.params.id;
  const { name, detail, alamat, profile_picture } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

    if (name) user.name = name;
    if (detail) user.detail = detail;
    if (alamat) user.alamat = alamat;
    if (profile_picture) user.profile_picture = profile_picture;

    await user.save();

    res.json({ message: 'Profil pengguna berhasil diperbarui', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui profil pengguna' });
  }
};

// POST: Tambah alamat baru ke user
exports.addAlamat = async (req, res) => {
  const userId = req.params.id;
  const alamatBaru = req.body;
  
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    
    // Jika ini adalah alamat pertama, otomatis jadikan utama
    if (user.alamat.length === 0) {
      alamatBaru.is_active = true;
    }
    
    // Jika alamat baru akan menjadi utama, set semua alamat lain menjadi tidak aktif
    if (alamatBaru.is_active) {
      user.alamat.forEach(alamat => {
        alamat.is_active = false;
      });
    }
    
    user.alamat.push(alamatBaru);
    await user.save();
    res.json({ message: 'Alamat berhasil ditambahkan', alamat: user.alamat });
  } catch (err) {
    console.error('Error adding address:', err);
    res.status(500).json({ error: 'Gagal menambah alamat' });
  }
};

// PUT: Edit alamat tertentu
exports.editAlamat = async (req, res) => {
  const userId = req.params.id;
  const alamatId = req.params.alamatId;
  const updateData = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    const alamat = user.alamat.id(alamatId);
    if (!alamat) return res.status(404).json({ error: 'Alamat tidak ditemukan' });
    Object.assign(alamat, updateData);
    await user.save();
    res.json({ message: 'Alamat berhasil diupdate', alamat });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengedit alamat' });
  }
};

// DELETE: Hapus alamat tertentu
exports.deleteAlamat = async (req, res) => {
  const userId = req.params.id;
  const alamatId = req.params.alamatId;
  
  try {
    // Cari user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }
    
    // Cari index alamat yang akan dihapus
    const addressIndex = user.alamat.findIndex(addr => addr._id.toString() === alamatId);
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Alamat tidak ditemukan' });
    }
    
    const isMainAddress = user.alamat[addressIndex].is_active;
    
    // Hapus alamat dari array
    user.alamat.splice(addressIndex, 1);
    
    // Jika alamat yang dihapus adalah alamat utama dan masih ada alamat lain
    if (isMainAddress && user.alamat.length > 0) {
      // Set alamat pertama sebagai alamat utama
      user.alamat[0].is_active = true;
    }
    
    // Simpan perubahan
    await user.save();
    
    res.json({ 
      message: 'Alamat berhasil dihapus', 
      alamat: user.alamat 
    });
    
  } catch (err) {
    console.error('Error deleting address:', err);
    res.status(500).json({ error: 'Gagal menghapus alamat' });
  }
};

// PATCH: Set alamat utama
exports.setAlamatUtama = async (req, res) => {
  const userId = req.params.id;
  const alamatId = req.params.alamatId;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    user.alamat.forEach(alamat => {
      alamat.is_active = alamat._id.toString() === alamatId;
    });
    await user.save();
    res.json({ message: 'Alamat utama berhasil diatur', alamat: user.alamat });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengatur alamat utama' });
  }
};

// PATCH: Upload foto profil (multipart/form-data)
exports.uploadProfilePicture = async (req, res) => {
  const userId = req.params.id;
  if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan' });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    // Hapus file lama jika ada
    if (user.profile_picture) {
      const oldPath = path.join(__dirname, '../public/uploads/', user.profile_picture);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    user.profile_picture = req.file.filename;
    await user.save();
    res.json({ message: 'Foto profil berhasil diupload', profile_picture: user.profile_picture });
  } catch (err) {
    res.status(500).json({ error: 'Gagal upload foto profil' });
  }
};