const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Untuk enkripsi password
const validator = require('validator'); // Untuk validasi email

// Definisikan schema untuk User
const userSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, 'Nama pengguna wajib diisi'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email pengguna wajib diisi'],
      unique: true, // Pastikan email unik
      lowercase: true,
      validate: {
        validator(value) {
          return validator.isEmail(value); // Validasi format email
        },
        message: 'Email tidak valid',
      },
    },
    password: {
      type: String,
      required: [true, 'Password wajib diisi'],
      minlength: [6, 'Password harus memiliki panjang minimal 6 karakter'],
    },
    no_telepon: {
      type: String,
      required: [true, 'Nomor telepon wajib diisi'],
      trim: true,
    },
    alamat: {
      type: String,
      required: [true, 'Alamat wajib diisi'],
      trim: true,
    },
    tanggal_daftar: {
      type: Date,
      default: Date.now, // Otomatis mengisi tanggal saat pendaftaran
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user', // Default role adalah 'user'
    },
  },
  { timestamps: true } // Secara otomatis menambahkan createdAt dan updatedAt
);

// Middleware untuk enkripsi password sebelum disimpan
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // Jika password tidak diubah, lanjutkan
  }

  try {
    const salt = await bcrypt.genSalt(10); // Menggunakan salt untuk enkripsi
    this.password = await bcrypt.hash(this.password, salt); // Enkripsi password
    next();
  } catch (err) {
    next(err);
  }
});

// Method untuk memverifikasi password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // Bandingkan password yang dimasukkan dengan yang terenkripsi
};

module.exports = mongoose.model('User', userSchema);