import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = 3000;
server.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('chat message', async (data) => {
        const { conversation } = data;
        try {
            if (!conversation || !Array.isArray(conversation)) {
                socket.emit('chat error', { error: 'Conversation history must be an array.' });
                return;
            }

            // Custom response for "hai"
            if (conversation.length === 1 && conversation[0].text.toLowerCase() === "hai") {
                socket.emit('chat response', { result: "Gemini Assistant siap membantu, ada hal apa yang harus saya kerjakan?" });
                return;
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
                    systemInstruction: 'Jawab hanya menggunakan bahasa Indonesia. Jawab dalam teks biasa tanpa menggunakan simbol markdown seperti *, #, /, \\, |, dan simbol khusus lainnya. Tahun sekarang adalah 2026.'
                }
            });

            const fullResponse = response.text;
            socket.emit('chat response', { result: fullResponse });
        } catch (e) {
            console.error("Error processing chat:", e);
            socket.emit('chat error', { error: e.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});