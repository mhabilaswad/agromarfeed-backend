const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load variabel dari .env
dotenv.config();

const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const artikelRoutes = require('./routes/artikelRoutes');
const productRoutes = require('./routes/productRoutes');
const productCompositionRoutes = require('./routes/productCompositionRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json()); // Middleware untuk membaca body JSON

// Routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/artikels', artikelRoutes);
app.use('/api/products', productRoutes);
app.use('/api/productCompositions', productCompositionRoutes);

// Koneksi MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Terhubung ke MongoDB');
  app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
})
.catch(err => {
  console.error('❌ Gagal terhubung ke MongoDB:', err);
  process.exit(1); // keluar dari proses jika gagal
});
