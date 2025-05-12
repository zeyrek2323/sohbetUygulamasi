const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const generateToken = (userId) => {
  // Basit bir örnek, JWT ile yapmak istersen ayrıca ayarlayabilirsin
  return userId.toString();
};

exports.register = async (req, res) => {
  console.log('Register endpoint called. Body:', req.body);
  try {
    const { username, password } = req.body;
    console.log('Register request:', req.body); // <-- EKLE

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('User already exists:', username); // <-- EKLE
      return res.status(400).json({
        message: 'User already exists with this username'
      });
    }

    // Create new user
    const user = new User({ username, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Register error:', error); // <-- EKLE
    res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Kullanıcıyı bul
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    // Şifreyi karşılaştır
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    // Token oluştur
    const token = generateToken(user._id);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.getProfile = (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

exports.updateProfile = (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

exports.getQuizScores = (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

exports.addQuizScore = (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};