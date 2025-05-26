const { GoogleGenAI } = require('@google/genai');
const UserChat = require('../models/userChat.model');

// Kullanıcının soru sorması ve AI'dan cevap alması
exports.askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user._id;

    // Gemini API'ye gönderilecek prompt'u hazırla
    const prompt = `
      Kullanıcı sorusu: ${question}
      
      Lütfen bu soruya detaylı ve anlaşılır bir şekilde cevap ver.
      Eğer soru belirsizse veya yanlış anlaşılmaya müsaitse, kullanıcıdan daha fazla bilgi iste.
      Cevabını Türkçe olarak ver.
    `;

    // Gemini API çağrısı
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt
    });
    
    const answer = response.text.trim();

    // Sohbet geçmişini kaydet
    const chat = new UserChat({
      userId,
      question,
      answer
    });

    await chat.save();

    res.json({
      question,
      answer,
      timestamp: chat.createdAt
    });
  } catch (err) {
    console.error('Soru cevaplanamadı:', err);
    res.status(500).json({ message: 'Soru cevaplanamadı', error: err.message });
  }
};

// Kullanıcının sohbet geçmişini getir
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await UserChat.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // Son 50 sohbeti getir

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Sohbet geçmişi getirilemedi', error: err.message });
  }
}; 