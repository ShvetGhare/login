const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Ensure this model exists and is correctly defined

const router = express.Router();

// POST route to handle login
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // If the password matches, login is successful
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
