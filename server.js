require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Added for session store
const passport = require('./config/passport');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors'); // Added for CORS
const path = require('path');
const fs = require('fs');

// Disable all console output in production (backend), kecuali console.error
if (process.env.NODE_ENV === 'production') {
  console.log = function () {};
  console.warn = function () {};
  console.info = function () {};
  console.debug = function () {};
  // console.error tetap tampil
}

const app = express();
const PORT = process.env.PORT || 4000;

// Force production mode for Vercel
if (process.env.VERCEL) {
  process.env.NODE_ENV = 'production';
  console.log('🔄 Forced NODE_ENV to production for Vercel');
}

app.set('trust proxy', 1);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Middleware
app.use(cors({ 
  origin: [ process.env.FRONTEND_URL, 'https://agromarfeed.com', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'Cookie'],

  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ 
      mongoUrl: process.env.MONGODB_URI,
      ttl: 24 * 60 * 60, // 24 hours in seconds
      autoRemove: 'native'
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true, // Changed to true for security
    },
    name: 'agromarfeed.sid',
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
    });
  } catch (error) {
    console.error('❌ Failed to connect DB:', error);
    process.exit(1); // Exit process if DB fails
  }
};

startServer();
module.exports = app;