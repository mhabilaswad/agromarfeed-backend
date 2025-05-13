const User = require('../models/User');
const bcrypt = require('bcrypt');

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
    });

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = (req, res) => {
  res.json({ message: 'Login successful', user: req.user });
};

exports.logout = (req, res) => {
  req.logout();
  res.json({ message: 'Logout successful' });
};