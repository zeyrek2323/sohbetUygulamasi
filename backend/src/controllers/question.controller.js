const Question = require('../models/question.model');
const { GoogleGenAI } = require('@google/genai');

// Gemini API ile cevap alma fonksiyonu
async function askGemini(question) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Kullanıcı sorusu: ${question}\nCevabını Türkçe ve detaylı şekilde ver.`;
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-pro',
    contents: prompt
  });
  return response.text.trim();
}

// POST /api/questions
exports.askQuestion = async (req, res) => {
  console.log('Soru-cevap endpointi çağrıldı:', req.body);
  try {
    const { question, username } = req.body;
    if (!question) return res.status(400).json({ message: 'Soru gerekli.' });
    const answer = await askGemini(question);
    const saved = await Question.create({ question, answer, username });
    res.status(201).json(saved);
  } catch (err) {
    console.error('Soru-cevap hatası:', err);
    res.status(500).json({ message: 'Soru-cevap işlemi başarısız.', error: err.message });
  }
};

// GET /api/questions
exports.getQuestions = async (req, res) => {
  try {
    const { kategori } = req.query;
    const filter = kategori ? { kategori } : {};
    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Geçmiş alınamadı.', error: err.message });
  }
}; 