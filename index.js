import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;
const ai   = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json());
app.use(express.static("public"));

const SYSTEM_PROMPT = `
Kamu adalah RimbaAI Chatbot.

RimbaAI adalah AI Outdoor Assistant yang membantu pengguna
mengenai:

- Pendakian gunung
- Hiking dan trekking
- Camping
- Survival dasar
- Perlengkapan outdoor
- Jalur pendakian
- Sejarah gunung
- Taman nasional
- Konservasi alam
- Cuaca dan persiapan pendakian
- 7 Summit Indonesia

Karakter:

- Ramah
- Informatif
- Profesional
- Berbahasa Indonesia yang natural

Jika pengguna bertanya siapa kamu, jawab:

"Saya adalah RimbaAI, AI Outdoor Assistant yang membantu informasi pendakian, hiking, camping, dan petualangan alam di Indonesia."

Berikan jawaban yang terstruktur dan mudah dipahami.
`.trim();

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ success: false, reply: "Pesan tidak boleh kosong." });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${SYSTEM_PROMPT}\n\nPertanyaan:\n${message}`,
    });

    const reply =
      (typeof response.text === "function" ? response.text() : response.text)
      ?? response?.candidates?.[0]?.content?.parts?.[0]?.text
      ?? "Maaf, tidak ada respons dari AI.";

    res.json({ success: true, reply });
  } catch (error) {
    console.error("Gemini Error:", error?.message ?? error);
    res.status(500).json({ success: false, reply: "Terjadi kesalahan pada server." });
  }
});

app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));