const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, interests } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email or username'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      interests
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        interests: user.interests
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        interests: user.interests
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['username', 'email', 'interests', 'profilePicture'];
    
    // Filter out invalid updates
    const validUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.user._id,
      validUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Get user quiz scores
exports.getQuizScores = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('quizScores');
    res.json(user.quizScores);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching quiz scores',
      error: error.message
    });
  }
};

// Add quiz score
exports.addQuizScore = async (req, res) => {
  try {
    const { category, score } = req.body;
    
    const user = await User.findById(req.user._id);
    user.quizScores.push({ category, score });
    await user.save();

    res.json({
      message: 'Quiz score added successfully',
      quizScores: user.quizScores
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding quiz score',
      error: error.message
    });
  }
}; 