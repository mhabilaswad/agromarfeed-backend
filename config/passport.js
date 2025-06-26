// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const GitHubStrategy = require('passport-github2').Strategy;
// const LocalStrategy = require('passport-local').Strategy;
// const bcrypt = require('bcrypt');
// const User = require('../models/user/User');

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// // ✅ Google OAuth Strategy
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`, // FULL URL
//   passReqToCallback: true,
// }, async (req, accessToken, refreshToken, profile, done) => {
//   try {
//     const email = profile.emails[0].value;
//     let user = await User.findOne({ email });

//     if (!user) {
//       user = await User.create({
//         name: profile.displayName,
//         email,
//         accounts: [{
//           provider: 'google',
//           providerAccountId: profile.id,
//           access_token: accessToken,
//           type: 'oauth',
//         }],
//         isVerified: true, // ✅ anggap OAuth verified
//       });
//     }

//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// }));

// // ✅ GitHub OAuth Strategy
// passport.use(new GitHubStrategy({
//   clientID: process.env.GITHUB_CLIENT_ID,
//   clientSecret: process.env.GITHUB_CLIENT_SECRET,
//   callbackURL: `${process.env.BACKEND_URL}/api/auth/github/callback`, // FULL URL
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
//     let user = await User.findOne({ email });

//     if (!user) {
//       user = await User.create({
//         name: profile.displayName || profile.username,
//         email,
//         accounts: [{
//           provider: 'github',
//           providerAccountId: profile.id,
//           access_token: accessToken,
//           type: 'oauth',
//         }],
//         isVerified: true, // ✅ verified juga
//       });
//     } else {
//       const existing = user.accounts.find(acc => acc.provider === 'github');
//       if (!existing) {
//         user.accounts.push({
//           provider: 'github',
//           providerAccountId: profile.id,
//           access_token: accessToken,
//           type: 'oauth',
//         });
//         await user.save();
//       }
//     }

//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// }));

// // Local Strategy
// passport.use(new LocalStrategy({
//   usernameField: 'email',
// }, async (email, password, done) => {
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return done(null, false, { message: 'No user found' });
//     if (!user.isVerified) return done(null, false, { message: 'Please verify your email first' });

//     const account = user.accounts.find(acc => acc.provider === 'email');
//     if (!account || !account.access_token) return done(null, false, { message: 'Invalid credentials' });

//     const isValid = await bcrypt.compare(password, account.access_token);
//     if (!isValid) return done(null, false, { message: 'Invalid credentials' });

//     return done(null, user);
//   } catch (error) {
//     return done(error);
//   }
// }));

// module.exports = passport;

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ==========================
// Google OAuth Strategy
// ==========================
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === 'production' 
    ? `${process.env.BACKEND_URL}/api/auth/google/callback`
    : '/api/auth/google/callback',
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const fullURL = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    console.log('Google OAuth callback hit from:', fullURL);

    const email = profile.emails?.[0]?.value;
    if (!email) {
      console.error('Email not found from Google profile');
      return done(new Error('Email not found from Google profile'), null);
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email,
        accounts: [{
          provider: 'google',
          providerAccountId: profile.id,
          access_token: accessToken,
          type: 'oauth',
        }],
        isVerified: true, // OAuth users are verified
      });
      console.log('New Google user created:', user.email);
    } else {
      // Check if Google account already exists
      const existingGoogleAccount = user.accounts.find(acc => acc.provider === 'google');
      if (!existingGoogleAccount) {
        user.accounts.push({
          provider: 'google',
          providerAccountId: profile.id,
          access_token: accessToken,
          type: 'oauth',
        });
        await user.save();
        console.log('Google account added to existing user:', user.email);
      }
    }

    done(null, user);
  } catch (err) {
    console.error('Google OAuth error:', err);
    done(err, null);
  }
}));

// ==========================
// GitHub OAuth Strategy
// ==========================
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === 'production' 
    ? `${process.env.BACKEND_URL}/api/auth/github/callback`
    : '/api/auth/github/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: profile.displayName || profile.username,
        email,
        accounts: [{
          provider: 'github',
          providerAccountId: profile.id,
          access_token: accessToken,
          type: 'oauth',
        }],
        isVerified: true, // OAuth users are verified
      });
      console.log('New GitHub user created:', user.email);
    } else {
      const accountExists = user.accounts.find(acc => acc.provider === 'github');
      if (!accountExists) {
        user.accounts.push({
          provider: 'github',
          providerAccountId: profile.id,
          access_token: accessToken,
          type: 'oauth',
        });
        await user.save();
        console.log('GitHub account added to existing user:', user.email);
      }
    }

    done(null, user);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    done(error, null);
  }
}));

// ==========================
// Local Strategy
// ==========================
passport.use(new LocalStrategy({
  usernameField: 'email',
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'No user found' });
    }

    if (!user.isVerified) {
      return done(null, false, { message: 'Please verify your email first' });
    }

    const account = user.accounts.find(acc => acc.provider === 'email');
    if (!account || !account.access_token) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, account.access_token);
    if (!isValid) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

module.exports = passport;