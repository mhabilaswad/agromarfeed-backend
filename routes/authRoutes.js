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
  console.log('User Agent:', req.headers['user-agent']);
  console.log('Origin:', req.headers.origin);
  console.log('Referer:', req.headers.referer);
  
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
      
      // Add a small delay before redirect to ensure session is saved
      setTimeout(() => {
        console.log('✅ Redirecting to frontend:', process.env.FRONTEND_URL);
        // Redirect to frontend with success parameter
        res.redirect(`${process.env.FRONTEND_URL}/?oauth=success`);
      }, 500);
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
  console.log('🔍 Current user request received');
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('User:', req.user);
  console.log('Is authenticated:', req.isAuthenticated());
  console.log('User Agent:', req.headers['user-agent']);
  console.log('Origin:', req.headers.origin);
  console.log('Cookies:', req.headers.cookie);
  
  if (req.isAuthenticated() && req.user) {
    console.log('✅ User authenticated, returning user data');
    res.json({
      success: true,
      user: req.user
    });
  } else {
    console.log('❌ User not authenticated');
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

// Mobile browser debugging endpoint
router.get('/mobile-debug', (req, res) => {
  console.log('=== Mobile Browser Debug ===');
  console.log('User Agent:', req.headers['user-agent']);
  console.log('Accept:', req.headers.accept);
  console.log('Accept-Language:', req.headers['accept-language']);
  console.log('Accept-Encoding:', req.headers['accept-encoding']);
  console.log('Connection:', req.headers.connection);
  console.log('Host:', req.headers.host);
  console.log('Origin:', req.headers.origin);
  console.log('Referer:', req.headers.referer);
  console.log('X-Forwarded-For:', req.headers['x-forwarded-for']);
  console.log('X-Forwarded-Proto:', req.headers['x-forwarded-proto']);
  console.log('All Headers:', req.headers);
  
  res.json({
    userAgent: req.headers['user-agent'],
    isMobile: /Mobile|Android|iPhone|iPad/.test(req.headers['user-agent'] || ''),
    headers: req.headers,
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    user: req.user
  });
});

module.exports = router;