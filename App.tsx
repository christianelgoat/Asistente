import React, { useState, useEffect, useRef } from 'react';
import { streamChatResponse } from './services/geminiService';
import { ChatMessage as ChatMessageType, ChatRole } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Mensaje de bienvenida inicial
    if (messages.length === 0) {
      setMessages([
        { role: ChatRole.MODEL, text: '¡Hola! ¿Cómo puedo ayudarte hoy?' },
      ]);
    }
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (userMessage: string) => {
    if (isLoading) return;

    const newUserMessage: ChatMessageType = { role: ChatRole.USER, text: userMessage };
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setIsLoading(true);
    setError(null);
    
    let modelResponse = '';
    // Agrega un placeholder para la respuesta del modelo
    setMessages(prev => [...prev, { role: ChatRole.MODEL, text: '' }]);

    try {
        const stream = await streamChatResponse(currentMessages);
        const reader = stream.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            modelResponse += decoder.decode(value, { stream: true });
            
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = modelResponse;
                return newMessages;
            });
        }

    } catch (e: any) {
      console.error(e);
      const errorMessage = 'Lo siento, no pude procesar tu solicitud. Por favor, inténtalo de nuevo.';
      setError(errorMessage);
      setMessages(prev => {
          const newMessages = [...prev];
          // Reemplaza el placeholder vacío con el mensaje de error
          if(newMessages[newMessages.length - 1].role === ChatRole.MODEL && newMessages[newMessages.length-1].text === ''){
            newMessages[newMessages.length - 1].text = errorMessage;
          } else {
            newMessages.push({ role: ChatRole.MODEL, text: errorMessage});
          }
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col">
      <header className="p-4 border-b border-slate-200 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 text-center">Asistente de Chat con IA</h1>
      </header>
        <>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              {isLoading && messages[messages.length - 1].role === ChatRole.MODEL && messages[messages.length-1].text === '' && (
                 <div className="flex items-start gap-4 my-4 justify-start">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.83,3.05c-0.1-0.21-0.34-0.35-0.6-0.35c-0.41,0-0.75,0.34-0.75,0.75v0.1c0,0.05,0.01,0.1,0.01,0.15l-0.01,0C11.45,4.29,11.5,5.1,11.5,5.1V6c0,2.21,1.79,4,4,4h0.9c0,0,0.01,0,0.01,0l0.02,0c0.05,0,0.1,0.01,0.15,0.01h0.1c0.41,0,0.75-0.34,0.75-0.75c0-0.26-0.14-0.5-0.35-0.61l7-3.5C24.11,5.2,24,5.1,24,5c0-0.41-0.34-0.75-0.75-0.75C23.15,4.25,12.92,3.1,12.83,3.05z"/><path d="M12,18H6c-2.21,0-4-1.79-4-4v-0.9c0,0,0-0.01,0-0.01l0-0.02C2,13.05,2.01,13,2.01,13h-0.1c-0.41,0-0.75,0.34-0.75,0.75c0,0.26,0.14,0.5,0.35,0.61l3.5,7c0.2,0.4,0.66,0.54,1.06,0.35c0.04-0.02,0.07-0.04,0.1-0.06l0,0c0.6-0.59,4.35-4.24,4.35-4.24l4.24,4.24l0,0c0.02,0.02,0.06,0.04,0.1,0.06c0.4,0.2,0.86,0.05,1.06-0.35l3.5-7c0.21-0.4,0.07-0.86-0.33-1.06c-0.05-0.02-0.1-0.04-0.15-0.05h-0.1c-0.01,0-0.01,0-0.02,0l0,0.02c0,0,0.01,0,0.01V14c0,2.21-1.79,4-4,4H12z"/></svg>
                      </div>
                      <div className="max-w-xl rounded-2xl p-4 bg-white shadow-sm rounded-bl-none flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce mr-2"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce mr-2 [animation-delay:0.1s]"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                </div>
              )}
              {error && <div className="text-red-500 text-center my-2 text-sm">{error}</div>}
              <div ref={messagesEndRef} />
            </div>
          </main>

          <footer className="w-full max-w-3xl mx-auto sticky bottom-0">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </footer>
        </>
    </div>
  );
};

export default App;
