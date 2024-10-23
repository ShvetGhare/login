const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Ensure correct path to User model

const router = express.Router();

// Signup Route
router.post('/', async (req, res) => {
  const { firstname, email, password, repeatPassword } = req.body;

  // Validate the data
  if (!firstname || !email || !password || password !== repeatPassword) {
    return res.status(400).json({ message: 'Please fill in all fields correctly' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      firstname,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
