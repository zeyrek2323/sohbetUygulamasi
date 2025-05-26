const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const auth = require('../middleware/auth');

// Kategoriye göre quiz sorularını getir
router.get('/:category', quizController.getQuizzesByCategory);

// Kategori ve test numarasına göre quiz sorularını getir
router.get('/:category/:testNo', quizController.getQuizzesByCategoryAndTest);

// Quiz cevaplarını kontrol et
router.post('/check', auth, quizController.checkAnswers);

// Quiz sonuçlarını analiz et
router.post('/analyze', auth, quizController.analyzeQuizResults);

// Yeni quiz sorusu ekle (admin için)
router.post('/', quizController.createQuiz);

module.exports = router; 