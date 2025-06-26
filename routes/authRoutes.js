const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/authController');

// Signup
router.post('/signup', authController.signup);

// Local Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message || 'Login failed' });
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ message: 'Login successful', user });
    });
  })(req, res, next);
});

// Google OAuth
router.get('/google', (req, res, next) => {
  console.log('🔍 Google OAuth initiated');
  console.log('Callback URL will be:', process.env.NODE_ENV === 'production' 
    ? `${process.env.BACKEND_URL}/api/auth/google/callback`
    : '/api/auth/google/callback');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  console.log('🔄 Google OAuth callback received');
  console.log('Full callback URL:', `${req.protocol}://${req.get('host')}${req.originalUrl}`);
  
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('❌ Google OAuth error:', err);
      return next(err);
    }
    if (!user) {
      console.error('❌ Google OAuth failed - no user:', info);
      return res.status(401).json({ message: info.message || 'Google login failed' });
    }
    
    console.log('✅ Google OAuth successful for user:', user.email);
    req.logIn(user, (err) => {
      if (err) {
        console.error('❌ Session login error:', err);
        return next(err);
      }
      console.log('✅ User session created, redirecting to:', process.env.FRONTEND_URL);
      // Redirect to frontend with success parameter
      res.redirect(`${process.env.FRONTEND_URL}/?oauth=success`);
    });
  })(req, res, next);
});

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message || 'GitHub login failed' });
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect(`${process.env.FRONTEND_URL}/`);
    });
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.json({ message: 'Logout successful' });
    });
  });
});

// backend: routes/authRoutes.js
router.get('/current-user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user }); // user is an object or undefined (if req.user is undefined)
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});


// Verifikasi email
router.get('/verify-email', authController.verifyEmail);

// Session check endpoint for debugging
router.get('/session-check', (req, res) => {
  console.log('Session check requested');
  console.log('Session ID:', req.sessionID);
  console.log('User in session:', req.user);
  console.log('Session data:', req.session);
  
  res.json({
    sessionID: req.sessionID,
    user: req.user,
    isAuthenticated: !!req.user,
    sessionData: req.session
  });
});

module.exports = router;