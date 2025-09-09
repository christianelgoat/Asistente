
import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("La variable de entorno API_KEY no está configurada. Asegúrate de que esté disponible en tu entorno de ejecución.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function createChatSession(): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'Eres un asistente de IA amigable y servicial llamado Gemini. Tu propósito es ayudar a los usuarios con sus preguntas de la manera más clara y concisa posible. Responde siempre en español.',
    },
  });
  return chat;
}
