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
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message || 'Google login failed' });
    req.logIn(user, (err) => {
      if (err) return next(err);
      // Redirect to frontend with token or session
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
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
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
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

module.exports = router;