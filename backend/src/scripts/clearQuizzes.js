const mongoose = require('mongoose');
const Quiz = require('../models/quiz.model');

mongoose.connect('mongodb://127.0.0.1:27017/sohbet-uygulamasi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  try {
    const result = await Quiz.deleteMany({});
    console.log(`Quiz koleksiyonundan silinen belge sayısı: ${result.deletedCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Hata:', err);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB bağlantı hatası:', err);
  process.exit(1);
}); 