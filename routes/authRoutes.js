const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/authController');

// Signup
router.post('/signup', authController.signup);

// Local Login
router.post('/login', (req, res, next) => {
  console.log('🔍 Login attempt received');
  console.log('Request body:', { email: req.body.email, password: req.body.password ? '[HIDDEN]' : 'missing' });
  console.log('Session ID before auth:', req.sessionID);
  
  passport.authenticate('local', (err, user, info) => {
    console.log('🔍 Passport authenticate callback');
    console.log('Error:', err);
    console.log('User:', user ? { id: user._id, email: user.email } : 'null');
    console.log('Info:', info);
    
    if (err) {
      console.error('❌ Passport error:', err);
      return next(err);
    }
    if (!user) {
      console.error('❌ Login failed - no user:', info);
      return res.status(401).json({ message: info.message || 'Login failed' });
    }
    
    console.log('✅ User authenticated, logging in...');
    req.logIn(user, (err) => {
      if (err) {
        console.error('❌ Session login error:', err);
        return next(err);
      }
      
      console.log('✅ User session created successfully');
      console.log('Session ID after login:', req.sessionID);
      console.log('Session data:', req.session);
      console.log('User in session:', req.user);
      
      // Force session save
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          return next(err);
        }
        
        console.log('✅ Session saved successfully');
        console.log('Final session ID:', req.sessionID);
        console.log('Final user:', req.user);
        
        return res.json({ message: 'Login successful', user });
      });
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
      

      // Force session save before redirect
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          return next(err);
        }
        
        console.log('✅ Session saved successfully');
        console.log('✅ Redirecting to frontend:', process.env.FRONTEND_URL);
        
        // Create a temporary session token for frontend
        const sessionToken = Buffer.from(JSON.stringify({
          sessionId: req.sessionID,
          userId: user._id,
          email: user.email,
          timestamp: Date.now()
        })).toString('base64');
        
        // Redirect to frontend with session token
        const redirectUrl = `${process.env.FRONTEND_URL}/?oauth=success&token=${sessionToken}`;
        res.redirect(redirectUrl);
      });

    });
  })(req, res, next);
});

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', (req, res, next) => {
  console.log('🔄 GitHub OAuth callback received');
  console.log('Full callback URL:', `${req.protocol}://${req.get('host')}${req.originalUrl}`);
  
  passport.authenticate('github', (err, user, info) => {
    if (err) {
      console.error('❌ GitHub OAuth error:', err);
      return next(err);
    }
    if (!user) {
      console.error('❌ GitHub OAuth failed - no user:', info);
      return res.status(401).json({ message: info.message || 'GitHub login failed' });
    }
    
    console.log('✅ GitHub OAuth successful for user:', user.email);
    req.logIn(user, (err) => {
      if (err) {
        console.error('❌ Session login error:', err);
        return next(err);
      }
      
      console.log('✅ User session created');
      console.log('Session ID:', req.sessionID);
      console.log('Session data:', req.session);
      
      // Force session save before redirect
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          return next(err);
        }
        
        console.log('✅ Session saved successfully');
        console.log('✅ Redirecting to frontend:', process.env.FRONTEND_URL);
        
        // Create a temporary session token for frontend
        const sessionToken = Buffer.from(JSON.stringify({
          sessionId: req.sessionID,
          userId: user._id,
          email: user.email,
          timestamp: Date.now()
        })).toString('base64');
        
        // Redirect to frontend with session token
        const redirectUrl = `${process.env.FRONTEND_URL}/?oauth=success&token=${sessionToken}`;
        res.redirect(redirectUrl);
      });
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

  console.log('User in session:', req.user);
  console.log('Is authenticated:', req.isAuthenticated());
  console.log('All cookies:', req.headers.cookie);

  
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

// Validate session token from OAuth redirect
router.post('/validate-oauth-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    
    // Decode the token
    const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
    console.log('🔍 Validating OAuth token:', decodedToken);
    
    // Check if token is not expired (5 minutes)
    const tokenAge = Date.now() - decodedToken.timestamp;
    if (tokenAge > 5 * 60 * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    // Find user by ID
    const User = require('../models/user/User');
    const user = await User.findById(decodedToken.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if session already exists and is valid for the same user
    if (req.isAuthenticated() && req.user && req.user._id.toString() === user._id.toString()) {
      console.log('✅ Session already exists and is valid for user:', user.email);
      console.log('Session ID:', req.sessionID);
      return res.json({
        success: true,
        user: user,
        sessionID: req.sessionID,
        message: 'Session already validated'
      });
    }
    
    // If session exists but for different user, or no session exists
    console.log('🔄 Setting session for user:', user.email);
    console.log('Current session ID:', req.sessionID);
    console.log('Current user in session:', req.user ? req.user.email : 'none');
    
    // Use req.logIn to properly set the session (same as OAuth callback)
    req.logIn(user, (err) => {
      if (err) {
        console.error('❌ Session login error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to set session'
        });
      }
      
      console.log('✅ Session set successfully for user:', user.email);
      console.log('New session ID:', req.sessionID);
      
      res.json({
        success: true,
        user: user,
        sessionID: req.sessionID,
        message: 'Session validated successfully'
      });
    });
    
  } catch (error) {
    console.error('❌ Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Token validation failed'
    });
  }

});

module.exports = router;