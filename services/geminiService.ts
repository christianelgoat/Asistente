import { GoogleGenAI, Chat } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI | null {
  if (ai) {
    return ai;
  }
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai;
  }
  return null;
}

export function createChatSession(): Chat | null {
  const genAI = getAiInstance();
  if (!genAI) {
    return null;
  }

  const chat = genAI.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'Eres un asistente de IA amigable y servicial llamado Gemini. Tu propósito es ayudar a los usuarios con sus preguntas de la manera más clara y concisa posible. Responde siempre en español.',
    },
  });
  return chat;
}