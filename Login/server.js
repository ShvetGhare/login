const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Ensure this model exists and is correctly defined

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/logindetails', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => console.log(err));

// POST route for signup
app.post('/signup', async (req, res) => {
  const { name, email, password, repeatPassword } = req.body;

  // Validate input
  if (!name || !email || !password || !repeatPassword) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  if (password !== repeatPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST route for login
app.post('/login', async (req, res) => {
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

// Serve the signup page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Serve the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
