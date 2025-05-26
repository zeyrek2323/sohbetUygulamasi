const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');

// Mesaj oluştur
router.post('/', messageController.createMessage);

// Kategoriye göre mesajları getir
router.get('/:category', messageController.getMessagesByCategory);

module.exports = router; 