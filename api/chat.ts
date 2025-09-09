import { GoogleGenAI, Chat, Content } from "@google/genai";
import { ChatMessage, ChatRole } from '../types';

// Vercel AI SDK Preamble
export const config = {
  runtime: 'edge',
};

// Convierte el historial de chat del frontend al formato que espera la API de Gemini
const toGeminiHistory = (messages: ChatMessage[]): Content[] => {
    return messages.slice(0, -1) // Excluye el último mensaje del usuario, que es el prompt actual
        .filter(msg => msg.text) // Filtra mensajes vacíos
        .map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  try {
    const { messages } = await req.json() as { messages: ChatMessage[] };
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== ChatRole.USER) {
        return new Response(JSON.stringify({ error: 'No user message found' }), { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: toGeminiHistory(messages),
      config: {
        systemInstruction: 'Eres un asistente de IA amigable y servicial llamado Gemini. Tu propósito es ayudar a los usuarios con sus preguntas de la manera más clara y concisa posible. Responde siempre en español.',
      },
    });

    const geminiStream = await chat.sendMessageStream({ message: lastMessage.text });
    
    // FIX: The `sendMessageStream` method returns an async generator, which cannot be directly
    // returned as a response. It needs to be converted to a ReadableStream.
    // Transforma el stream de Gemini a un stream que el navegador pueda leer
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of geminiStream) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      },
    });

    // Devuelve el stream directamente al cliente
    return new Response(stream, {
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error: any) {
    console.error("Error en la función de chat:", error);
    return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred' }), { status: 500 });
  }
}
