require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 🔑 API anahtarını .env dosyasından al
const apiKey = process.env.GEMINI_API_KEY;

// ✅ API anahtarı var mı kontrolü
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY .env dosyasında bulunamadı.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function runTest() {
  try {
    // 🔧 Burada model adı ve sürüm doğru
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent("Merhaba! Bana güzel bir öneride bulunur musun?");
    const response = await result.response;
    const text = response.text();

    console.log("🟢 AI cevabı:");
    console.log(text);
  } catch (error) {
    console.error("🔴 Gemini test hatası:", error);
  }
}

runTest();

