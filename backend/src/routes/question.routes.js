const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');

// Soru sor (yeni ekle)
router.post('/', questionController.askQuestion);
// Tüm geçmişi getir
router.get('/', questionController.getQuestions);

module.exports = router; 