const express = require('express');
const router = express.Router();
const User = require('./models/User');
const SavedRecipe = require('./models/SavedRecipe');
const jwt = require('jsonwebtoken');

// Sign Up
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { name: user.name, email: user.email },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Sign in successful',
      user: { name: user.name, email: user.email },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify JWT
function auth(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Save a recipe
router.post('/save-recipe', auth, async (req, res) => {
  try {
    const saved = new SavedRecipe({
      userId: req.user.userId,
      recipe: req.body.recipe
    });
    await saved.save();
    res.status(201).json({ message: 'Recipe saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get saved recipes for current user
router.get('/saved-recipes', auth, async (req, res) => {
  try {
    const recipes = await SavedRecipe.find({ userId: req.user.userId });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user details
router.get('/me', async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ name: user.name, email: user.email });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Update user details
router.put('/update', async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    await user.save();
    res.json({ name: user.name, email: user.email });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;