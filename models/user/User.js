const mongoose = require("mongoose");

const alamatSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: false,
  },
  nomor_hp: {
    type: String,
    required: false,
  },
  label_alamat: {
    type: String,
    required: false,
  },
  provinsi: {
    type: String,
    required: false,
  },
  kabupaten: {
    type: String,
    required: false,
  },
  kecamatan: {
    type: String,
    required: false,
  },
  desa: {
    type: String,
    required: false,
  },
  kode_pos: {
    type: Number,
    required: false,
  },
  alamat_lengkap: {
    type: String,
    required: false,
  },
  catatan_kurir: {
    type: String,
    required: false,
  },
  is_active: {
    type: Boolean,
    required: false,
  },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  accounts: [
    {
      provider: { type: String, required: true },
      providerAccountId: { type: String, required: true },
      access_token: { type: String },
      type: { type: String, default: "credentials" },
    },
  ],
  detail: [
    {
      no_telpon: { type: String, required: false },
      tanggal_lahir: { type: Date, required: false },
      jenis_kelamin: {
        type: String,
        enum: ['Laki-laki', 'Perempuan'],
        required: false
      },
    },
  ],
  alamat: [alamatSchema],
  role: {
    type: String,
    enum: ['pembeli', 'admin', 'penjual'],
    default: "pembeli"
  },
});

// Add indexes
userSchema.index({ "accounts.providerAccountId": 1 });
module.exports = mongoose.model("User", userSchema);