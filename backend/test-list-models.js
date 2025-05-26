import {GenerativeAI} from '@google/generative-ai';

const genAI = new GenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

async function listModels() {
  try {
    // Doğru method burada `genAI.models.list()` şeklinde çağrılıyor:
    const response = await genAI.models.list();
    console.log('Modeller:', response);
  } catch (error) {
    console.error('❌ Model listesi alınamadı:', error);
  }
}

listModels();
