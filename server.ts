import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API endpoint for chatbot
app.post("/api/chat", async (req: any, res: any) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (e: any) {
      if (e.message === "GEMINI_API_KEY_MISSING") {
        return res.status(500).json({
          error: "API Key Gemini belum dikonfigurasi. Harap tambahkan GEMINI_API_KEY di menu Secrets."
        });
      }
      throw e;
    }

    const systemInstruction = `
      Anda adalah "Asisten AI PeduliTB", seorang pakar medis virtual khusus penyakit Tuberkulosis (TB) yang ramah, profesional, dan empatik.
      Tugas utama Anda adalah menjawab pertanyaan pasien, keluarga, kader, atau tenaga medis mengenai Tuberkulosis (TB), pengobatan OAT (Obat Anti Tuberkulosis), pencegahan, efek samping obat, kepatuhan, dan nutrisi dengan informasi akurat berdasarkan panduan medis resmi.
      
      Aturan:
      1. Berikan jawaban yang menenangkan, jelas, praktis, dan mudah dipahami dalam Bahasa Indonesia.
      2. Selalu ingatkan pengguna bahwa AI adalah asisten edukasi dan tidak menggantikan konsultasi langsung dengan Dokter atau Puskesmas setempat untuk diagnosis atau perubahan terapi.
      3. Jangan menyarankan obat di luar resep resmi OAT atau dosis tanpa pengawasan dokter.
      4. Jika pengguna bertanya tentang keadaan darurat (misal batuk darah hebat, sesak napas berat, kulit sangat kuning), segera sarankan mereka ke UGD/Puskesmas/Rumah Sakit terdekat secara mendesak.
    `;

    // Format chat history for @google/genai SDK
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    }
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const text = response.text || "Maaf, saya tidak dapat memproses jawaban saat ini.";
    res.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Terjadi kesalahan pada server AI." });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
