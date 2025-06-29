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
      
      console.log('✅ User session created');
      console.log('Session ID:', req.sessionID);
      console.log('Session data:', req.session);
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('Cookie settings - secure:', process.env.NODE_ENV === 'production');
      console.log('Cookie settings - sameSite:', process.env.NODE_ENV === 'production' ? 'none' : 'lax');
      
      // Force session save before redirect
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          return next(err);
        }
        
        console.log('✅ Session saved successfully');
        console.log('✅ Redirecting to frontend:', process.env.FRONTEND_URL);
        
        // Redirect to frontend with success parameter and session info
        const redirectUrl = `${process.env.FRONTEND_URL}/?oauth=success&session=${req.sessionID}`;
        res.redirect(redirectUrl);
      });
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

// Session debug endpoint
router.get('/session-debug', (req, res) => {
  console.log('Session debug requested');
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('User:', req.user);
  console.log('Is authenticated:', req.isAuthenticated());
  
  res.json({
    sessionID: req.sessionID,
    sessionData: req.session,
    user: req.user,
    isAuthenticated: req.isAuthenticated(),
    cookies: req.headers.cookie
  });
});

// Current user endpoint
router.get('/current-user', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
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

// Test OAuth session endpoint
router.get('/test-oauth-session', (req, res) => {
  console.log('=== OAuth Session Test ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('User:', req.user);
  console.log('Is authenticated:', req.isAuthenticated());
  console.log('All cookies:', req.headers.cookie);
  console.log('Session cookie:', req.cookies['agromarfeed.sid']);
  
  res.json({
    nodeEnv: process.env.NODE_ENV,
    sessionID: req.sessionID,
    sessionData: req.session,
    user: req.user,
    isAuthenticated: req.isAuthenticated(),
    allCookies: req.headers.cookie,
    sessionCookie: req.cookies['agromarfeed.sid']
  });
});

// Session transfer endpoint for OAuth
router.get('/oauth-session-transfer', (req, res) => {
  console.log('🔄 OAuth session transfer requested');
  console.log('Session ID:', req.sessionID);
  console.log('User:', req.user);
  console.log('Is authenticated:', req.isAuthenticated());
  
  if (req.isAuthenticated() && req.user) {
    // Set CORS headers for cross-domain cookie transfer
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.json({
      success: true,
      user: req.user,
      sessionID: req.sessionID,
      message: 'Session transfer successful'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'No valid session found'
    });
  }
});

module.exports = router;