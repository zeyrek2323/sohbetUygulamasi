const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  fullName: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be longer than 500 characters'],
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  birthDate: {
    type: Date,
    default: null
  },
  education: {
    type: String,
    default: ''
  },
  interests: [{
    type: String,
    enum: ['tarih', 'spor', 'bilim', 'teknoloji', 'sanat', 'müzik', 'edebiyat']
  }],
  score: {
    type: Number,
    default: 0
  },
  achievements: [{
    type: String
  }],
  quizScores: [{
    category: String,
    score: Number,
    date: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 