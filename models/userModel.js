const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true},
  username: { type: String, unique: true },
  password: String,
  balance: { type: Number, default: 0 },
  referralLink: String,
  referralCount: { type: Number, default: 0 },
  referralExpiry: Date,
  referralLinkUsageHistory: [
    {
      referralLink: String,
      usageDate: { type: Date, default: Date.now },
      users: [String],
    }
  ],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

userSchema.pre('save', async function (next) {
  try {
    if (!this.userId) {
      const lastUser = await this.constructor.findOne({}, {}, { sort: { userId: -1 } });
      this.userId = lastUser ? lastUser.userId + 1 : 1;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
