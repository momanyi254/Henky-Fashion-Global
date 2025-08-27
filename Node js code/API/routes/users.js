const express = require('express');
const route = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../../model/user');
const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/checkAdmin');

// ================== SIGNUP ==================
route.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, age, region, country } = req.body;

    // 1. Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !age || !region || !country) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // 2. Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // 3. Assign role (admin only if exact email)
    let role = 'user';
    if (email.toLowerCase() === 'henkygroupltd@gmail.com') {
      role = 'admin';
    }

    // 4. Save user
    const user = new User({
      firstName,
      lastName,
      email,
      password, // password hashing handled in User model pre-save hook
      phone,
      age,
      region,
      country,
      role
    });

    const savedUser = await user.save();

    // 5. Generate JWT
    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // 6. Response
    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

// ================== LOGIN ==================
route.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Auth failed: Invalid email or password' });
    }

    // 3. Check password
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Auth failed: Invalid email or password' });
    }

    // 4. Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5. Send response (with user info, no password)
    res.status(200).json({
      message: 'Auth successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

// ================== GET ALL USERS (Admins only) ==================
route.get('/', checkAuth, checkAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== GET ADMINS ONLY ==================
route.get('/admins', checkAuth, checkAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
route.delete('/:userId', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ _id: userId });
    res.status(200).json({ message: `User ${user.email} deleted successfully` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = route;
