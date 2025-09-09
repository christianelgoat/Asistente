import { ChatMessage } from '../types';

export async function streamChatResponse(messages: ChatMessage[]) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error del servidor: ${response.status} ${errorText}`);
  }
  
  if (!response.body) {
    throw new Error('La respuesta del servidor no contiene un cuerpo.');
  }

  return response.body;
}
