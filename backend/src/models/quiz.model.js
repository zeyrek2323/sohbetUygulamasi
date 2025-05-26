const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Tarih', 'Bilim', 'Spor', 'Teknoloji', 'Müzik']
  },
  difficulty: {
    type: String,
    enum: ['Kolay', 'Orta', 'Zor'],
    default: 'Orta'
  },
  testNo: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema); 