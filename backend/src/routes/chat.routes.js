const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const auth = require('../middleware/auth');

// Soru sor ve cevap al
router.post('/ask', auth, chatController.askQuestion);

// Sohbet geçmişini getir
router.get('/history', auth, chatController.getChatHistory);

module.exports = router; 