const Message = require('../models/message.model');

// Mesaj oluştur
exports.createMessage = async (req, res) => {
  try {
    const { user, text, category } = req.body;
    const message = new Message({ user, text, category });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Mesaj kaydedilemedi', error: err.message });
  }
};

// Kategoriye göre mesajları getir (son 50 mesaj)
exports.getMessagesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const messages = await Message.find({ category })
      .sort({ timestamp: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Mesajlar getirilemedi', error: err.message });
  }
};

// Sohbeti temizle
exports.clearChat = async (req, res) => {
  try {
    const { username } = req.params;
    const { category } = req.body;
    console.log('clearChat called:', { username, category });

    if (!username || !category) {
      console.error('Eksik parametre:', { username, category });
      return res.status(400).json({ message: 'Eksik parametre', username, category });
    }

    await UserChat.findOneAndUpdate(
      { username, category },
      { lastClearedAt: new Date() },
      { upsert: true }
    );

    console.log('Sohbet temizlendi:', { username, category });
    res.json({ message: 'Sohbet temizlendi' });
  } catch (err) {
    console.error('clearChat error:', err);
    res.status(500).json({ message: 'Sohbet temizlenemedi', error: err.message });
  }
}; 