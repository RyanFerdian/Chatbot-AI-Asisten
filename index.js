import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!conversation || !Array.isArray(conversation)) {
            return res.status(400).json({ error: 'Conversation history must be an array.' });
        }

        // Custom response for "hai"
        if (conversation.length === 1 && conversation[0].text.toLowerCase() === "hai") {
            return res.status(200).json({ result: "Asisten pribadi siap membantu, ada hal apa yang harus saya kerjakan?" });
        }

        const contents = conversation.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: 'Jawab hanya menggunakan bahasa Indonesia. Jawab dalam teks biasa tanpa menggunakan simbol markdown seperti *, #, /, \\, |, dan simbol khusus lainnya.'
            }
        });

        res.status(200).json({ result: response.text });
    }
    catch (e) {
        console.error("Error processing chat:", e);
        res.status(500).json({ error: e.message });
    }
});