const Quiz = require('../models/quiz.model');
const QuizAnalysis = require('../models/quizAnalysis.model');
const { GoogleGenAI } = require('@google/genai');

// Kategoriye göre quiz sorularını getir
exports.getQuizzesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { difficulty } = req.query;
    
    let query = { category };
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Rastgele 5 soru yerine, tüm soruları döndür
    const quizzes = await Quiz.find(query);
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Quiz soruları getirilemedi', error: err.message });
  }
};

// Quiz cevaplarını kontrol et
exports.checkAnswers = async (req, res) => {
  try {
    const { answers } = req.body;
    const results = [];
    let score = 0;

    for (const answer of answers) {
      const quiz = await Quiz.findById(answer.quizId);
      if (!quiz) continue;

      const isCorrect = quiz.correctAnswer === answer.selectedOption;
      if (isCorrect) score++;

      results.push({
        quizId: answer.quizId,
        question: quiz.question,
        correctAnswer: quiz.correctAnswer,
        userAnswer: answer.selectedOption,
        isCorrect
      });
    }

    res.json({
      score,
      totalQuestions: answers.length,
      results
    });
  } catch (err) {
    res.status(500).json({ message: 'Cevaplar kontrol edilemedi', error: err.message });
  }
};

// Yeni quiz sorusu ekle (admin için)
exports.createQuiz = async (req, res) => {
  try {
    const { question, options, correctAnswer, category, difficulty } = req.body;
    
    const quiz = new Quiz({
      question,
      options,
      correctAnswer,
      category,
      difficulty
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Quiz sorusu eklenemedi', error: err.message });
  }
};

// Kategori ve test numarasına göre quiz sorularını getir
exports.getQuizzesByCategoryAndTest = async (req, res) => {
  try {
    const { category, testNo } = req.params;
    const quizzes = await Quiz.find({ category, testNo: Number(testNo) }).sort({ _id: 1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Quiz soruları getirilemedi', error: err.message });
  }
};

// Quiz sonuçlarını analiz et ve AI önerileri al
exports.analyzeQuizResults = async (req, res) => {
  try {
    const { answers, category, testNo } = req.body;
    const userId = req.user._id;

    const results = [];
    let score = 0;
    const correctAnswers = [];
    const wrongAnswers = [];

    for (const answer of answers) {
      const quiz = await Quiz.findById(answer.quizId);
      if (!quiz) continue;

      const isCorrect = quiz.correctAnswer === answer.selectedOption;
      if (isCorrect) {
        score++;
        correctAnswers.push({
          question: quiz.question,
          answer: quiz.correctAnswer
        });
      } else {
        wrongAnswers.push({
          question: quiz.question,
          userAnswer: answer.selectedOption,
          correctAnswer: quiz.correctAnswer
        });
      }

      results.push({
        quizId: answer.quizId,
        question: quiz.question,
        correctAnswer: quiz.correctAnswer,
        userAnswer: answer.selectedOption,
        isCorrect
      });
    }

    // Gemini API'ye gönderilecek prompt'u hazırla
    const prompt = `
      Kategori: ${category}
      Test No: ${testNo}
      Toplam Soru: ${answers.length}
      Doğru Cevap: ${score}
      Yanlış Cevap: ${answers.length - score}

      Doğru Cevaplanan Sorular:
      ${correctAnswers.map(q => `- ${q.question}`).join('\n')}

      Yanlış Cevaplanan Sorular:
      ${wrongAnswers.map(q => `- ${q.question} (Kullanıcı: ${q.userAnswer}, Doğru: ${q.correctAnswer})`).join('\n')}

      Lütfen bu quiz sonuçlarına göre:
      1. Kullanıcının güçlü yönlerini
      2. Geliştirilmesi gereken alanları
      3. Önerileri
      4. Kişiselleştirilmiş çalışma planını
      5. Motivasyonel bir mesaj

      JSON formatında döndür. Format:
      {
        "strengths": ["güçlü yön 1", "güçlü yön 2"],
        "weaknesses": ["geliştirilmesi gereken alan 1", "geliştirilmesi gereken alan 2"],
        "recommendations": ["öneri 1", "öneri 2"],
        "studyPlan": ["çalışma planı 1", "çalışma planı 2"],
        "motivationalMessage": "motivasyonel mesaj"
      }
    `;

    // Yeni SDK ile Gemini API çağrısı
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt
    });
    let aiText = response.text.trim();
    // Kod bloğu varsa temizle
    if (aiText.startsWith('```json')) {
      aiText = aiText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (aiText.startsWith('```')) {
      aiText = aiText.replace(/^```/, '').replace(/```$/, '').trim();
    }
    const aiAnalysis = JSON.parse(aiText);

    // Analiz sonuçlarını kaydet
    const quizAnalysis = new QuizAnalysis({
      userId,
      category,
      testNo,
      score,
      totalQuestions: answers.length,
      correctAnswers,
      wrongAnswers,
      aiAnalysis
    });

    await quizAnalysis.save();

    res.json({
      score,
      totalQuestions: answers.length,
      results,
      aiAnalysis
    });
  } catch (err) {
    console.error('Quiz analizi yapılamadı:', err);
    res.status(500).json({ message: 'Quiz analizi yapılamadı', error: err.message });
  }
}; 