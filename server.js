require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Added for session store
const passport = require('./config/passport');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors'); // Added for CORS

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true })); // Allow frontend origin
app.use(express.json());
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

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect DB:', error);
    throw error;
  }
};

startServer();

module.exports = app;