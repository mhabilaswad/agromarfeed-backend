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

// Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback', // relatif, bukan full
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // req.headers.host bisa jadi 'localhost:4000' atau 'yourdomain.com'
    const fullURL = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    console.log('Callback hit from:', fullURL); // debug

    // Proses login biasa...
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        accounts: [{
          provider: 'google',
          providerAccountId: profile.id,
          access_token: accessToken,
          type: 'oauth',
        }],
      });
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));


// In passport.js, update the GitHubStrategy callback
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'api/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Fallback to profile.username if email is not available
        const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username,
            email,
            accounts: [
              {
                provider: 'github',
                providerAccountId: profile.id,
                access_token: accessToken,
                type: 'oauth',
              },
            ],
          });
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
          }
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Local (Credentials) Strategy
// Local (Credentials) Strategy
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: 'No user found' });
        }

        // ✅ Cek apakah user sudah verifikasi email
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
    }
  )
);


module.exports = passport;