const User = require('../models/user/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.create({
      name,
      email,
      accounts: [
        {
          provider: 'email',
          providerAccountId: email,
          access_token: hashedPassword,
          type: 'credentials',
        },
      ],
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: Date.now() + 1000 * 60 * 60, // 1 jam
      isVerified: false,
    });

    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;
    
await sendEmail({
  to: email,
  subject: 'Verifikasi Email Anda - AgromarFeed',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #2e7d32;">Selamat Datang di AgroMarFeed!</h2>
      <p>Halo <strong>${name}</strong>,</p>
      <p>Terima kasih telah mendaftar di <strong>AgroMarFeed</strong>. Untuk mengaktifkan akun Anda, silakan verifikasi alamat email ini dengan mengklik tombol di bawah:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verifikasi Email
        </a>
      </div>
      <p>Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut di browser Anda:</p>
      <p style="word-break: break-all;"><a href="${verificationUrl}">${verificationUrl}</a></p>
      <hr style="margin: 30px 0;" />
      <p style="font-size: 12px; color: #777;">
        Email ini dikirim secara otomatis. Jika Anda merasa tidak pernah membuat akun, abaikan email ini.
      </p>
    </div>
  `,
});


    return res.status(201).json({ message: 'User created. Please check your email to verify.' });
  } catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).json({ message: 'Missing token' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    // Redirect langsung ke halaman login frontend
    return res.redirect(`${process.env.FRONTEND_URL}/auth/login`);
  } catch (err) {
    console.error('Error verifying email:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
