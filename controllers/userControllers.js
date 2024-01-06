const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const mongoose = require('mongoose');
const {validationResult} = require('express-validator');

async function registerUser(req, res) {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).send({error: errors.array()[0].msg});
    }

    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
      return res.status(400).send({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Registration Error:', err); 
    res.status(500).send({ error: 'Failed to register user' });
  }
}

  

async function loginUser(req, res) {
  try {
    console.log('Starting loginUser function');
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
          console.log('Validation error:', errors.array()[0].msg);
          return res.status(400).send({ error: errors.array()[0].msg });
      }
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      console.log('User not found');
      return res.status(404).send({ error: 'User not found' });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      console.log('Invalid password');
      return res.status(401).send({ error: 'Invalid password' });
    }
    const token = jwt.sign({ userId: user._id }, 'secretkey');
    console.log('Login successful, token:', token);
    res.send({ token });
  } catch (err) {
    console.log('Error in loginUser function:', err);
    res.status(500).send({ error: 'Failed to login' });
  }
}

  

async function registerWithReferral(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ error: errors.array()[0].msg });
    }

    const { username, password, referralLink } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ error: 'User already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    let referredUser = null;

    if (referralLink) {
      referredUser = await User.findOne({ referralLink });
    }

    if (referredUser) {
      if (referredUser.referralCount < 5 && (!referredUser.referralExpiry || referredUser.referralExpiry > Date.now())) {
        referredUser.balance += 5000;
        referredUser.referralCount += 1;

        referredUser.referralLinkUsageHistory.push({
          referralLink,
          users: [username], // Store usernames instead of ObjectId
        });

        await referredUser.save();
      } else {
        return res.status(400).send({ error: 'Referral link is no longer valid' });
      }
    }

    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).send({ error: 'Failed to register user' });
  }
}


  

async function addBalance(req, res) {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).send({error: errors.array()[0].msg});
    }
    
    const { username, amount } = req.body;
    const user = await User.findOneAndUpdate(
      { username },
      { $inc: { balance: amount } },
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    
    res.status(200).send({ message: 'Balance added successfully' });
  } catch (err) {
    console.error('Error in addBalance:', err);
    res.status(500).send({ error: 'Failed to add balance' });
  }
}

  
async function generateReferralLink(req, res) {
    try {
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        return res.status(400).send({error: errors.array()[0].msg});
      }
      const token = req.headers.authorization.split(" ")[1];
      const payload = jwt.verify(token, 'secretkey');
      const user = await User.findOne({ _id: payload.userId });
  
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      const referralCode = generateReferralCode();
      user.referralLink = referralCode;
      user.referralCount = 0;
      user.referralExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      await user.save();
  
      res.status(200).send({ referralLink: referralCode });
    } catch (err) {
      res.status(500).send({ error: 'Failed to generate referral link' });
    }
  }
  
  function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const referralCodeLength = 8;
    let referralCode = '';
    for (let i = 0; i < referralCodeLength; i++) {
      referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return referralCode;
  }

  async function getBalance(req, res) {
    try {
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        return res.status(400).send({error: errors.array()[0].msg});
      }
      const token = req.headers.authorization.split(" ")[1];
      const payload = jwt.verify(token, 'secretkey');
      const user = await User.findOne({ _id: payload.userId });
  
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      res.status(200).send({ balance: user.balance });
    } catch (err) {
      res.status(500).send({ error: 'Failed to get balance' });
    }
  }

async function expireReferralLink(req, res) {
    try {
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        return res.status(400).send({error: errors.array()[0].msg});
      }
      const { username } = req.body;  
      const existingUser = await User.findOne({ username });

      if (!existingUser) {
        return res.status(404).send({ error: 'User not found' });
      }

      const user = await User.findOneAndUpdate({ username }, { referralLink: null, referralExpiry: null }, { new: true });
  
      res.status(200).send({ message: 'Referral link expired successfully' });
    } catch (err) {
      res.status(500).send({ error: 'Failed to expire referral link' });
    }
}

async function getUserProfile(req, res) {
  try{
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(token, 'secretkey');
    const user = await User.findOne({ _id: payload.userId });
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.status(200).send({ user });
  }catch(err){
    res.status(500).send({ error: 'Failed to get user profile' });
  }
}


async function getAllUsers(req, res) {
  try {
    const users = await User.find({}, 'username balance referralLink referralCount');
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function getUserById(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId: Number(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

async function updateUserBalance(req, res) {
  try {
    const { userId } = req.params;
    const { newBalance } = req.body;

    const user = await User.findOne({userId: Number(userId)});
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.balance = newBalance;
    await user.save();

    res.status(200).json({ message: 'User balance updated successfully' });
  } catch (error) {
    console.error('Error updating user balance:', error);
    res.status(500).json({ error: 'Failed to update user balance' });
  }
}

async function expireReferralLinkAdmin(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findOne({userId: Number(userId)});
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.referralLink = null;
    user.referralExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Referral link expired successfully' });
  } catch (error) {
    console.error('Error expiring referral link:', error);
    res.status(500).json({ error: 'Failed to expire referral link' });
  }
}
  

module.exports = {
  registerUser,
  loginUser,
  registerWithReferral,
  addBalance,
  generateReferralLink,
  getBalance,
  expireReferralLink,
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUserBalance,
  expireReferralLinkAdmin,
};
