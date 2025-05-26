const mongoose = require('mongoose');

const quizAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  testNo: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: [{
    question: String,
    answer: String
  }],
  wrongAnswers: [{
    question: String,
    userAnswer: String,
    correctAnswer: String
  }],
  aiAnalysis: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    studyPlan: [String],
    motivationalMessage: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QuizAnalysis', quizAnalysisSchema); 