const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  accounts: [
    {
      provider: { type: String, required: true },
      providerAccountId: { type: String, required: true },
      access_token: { type: String },
      type: { type: String, default: 'credentials' },
    },
  ],
});

// Add indexes
userSchema.index({ 'accounts.providerAccountId': 1 });

module.exports = mongoose.model('User', userSchema);