require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Added for session store
const passport = require('./config/passport');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors'); // Added for CORS

const app = express();
const PORT = process.env.PORT || 4000;

// Debug logging
console.log('🔧 Environment Debug Info:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('BACKEND_URL:', process.env.BACKEND_URL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing');

app.set('trust proxy', 1);

// Middleware
app.use(cors({ 
  origin: process.env.FRONTEND_URL, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const artikelRoutes = require('./routes/artikelRoutes');
const productRoutes = require('./routes/productRoutes');
const productCompositionRoutes = require('./routes/productCompositionRoutes');
const chatRoutes = require('./routes/chat');
const productReviewRoutes = require('./routes/productReviewRoutes');
const cartRoutes = require('./routes/cartRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const konsultanRoutes = require('./routes/konsultanRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const storeRoutes = require('./routes/storeRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AgroMarFeed API' });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/artikels', artikelRoutes);
app.use('/api/products', productRoutes);
app.use('/api/productCompositions', productCompositionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/productReviews', productReviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/konsultan', konsultanRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// // Start server after DB connection (BE hosting)
// const startServer = async () => {
//   try {
//     await connectDB();
//   } catch (error) {
//     console.error('Failed to connect DB:', error);
//     throw error;
//   }
// };

// Mulai server setelah database connect lokal
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect DB:', error);
    process.exit(1); // Exit process if DB fails
  }
};

startServer();
module.exports = app;