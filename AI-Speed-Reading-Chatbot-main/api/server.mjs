import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config(); // Still works on local. On Vercel, use environment variables via dashboard.

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatHistory = [];

const persona = `You are a friendly and intelligent AI assistant trained to help users find and book hotels, plan travel itineraries, and explore destinations. 
You explain things clearly, adapt to the user's preferences and travel needs, and offer practical tips, personalized recommendations, and encouragement. 
Explain concepts clearly, adapting to the user’s experience level—offering simple suggestions for first-time travelers and detailed advice for seasoned explorers. Keep responses concise, insightful, and strictly focused on travel-related topics such as hotel bookings, destination guides, itinerary planning, or travel tips. If users ask about unrelated topics, gently respond, “I’m sorry, I can only assist with travel-related queries. Would you like help finding a hotel or planning a trip?” Use the app’s features (e.g., real-time booking updates, personalized itineraries, voice chat) to enhance guidance, and inspire users to explore new destinations and book confidently.`;

async function sendMessage(userMessage) {
    const fullUserMessage = persona + " " + userMessage;
    chatHistory.push({ role: "user", parts: [{ text: fullUserMessage }] });

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: chatHistory,
        });

        const replyText = result.candidates[0]?.content?.parts[0]?.text;
        return replyText;
    } catch (error) {
        console.error("Error generating content:", error);
        return "Sorry, something went wrong.";
    }
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests allowed" });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Missing 'message' in request body" });
    }

    const reply = await sendMessage(message);
    res.status(200).json({ message: reply });
}
