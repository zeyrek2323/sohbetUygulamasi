const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Tüm mesajları getir
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni mesaj ekle
router.post('/messages', async (req, res) => {
  const message = new Message({
    user: req.body.user,
    text: req.body.text,
    category: req.body.category,
    timestamp: new Date()
  });

  try {
    const newMessage = await message.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Kategoriye göre mesajları getir
router.get('/messages/:category', async (req, res) => {
  try {
    const messages = await Message.find({ category: req.params.category }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 