
import React from 'react';
import { ChatMessage as ChatMessageType, ChatRole } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-semibold flex-shrink-0">
        U
    </div>
);

const ModelIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.83,3.05c-0.1-0.21-0.34-0.35-0.6-0.35c-0.41,0-0.75,0.34-0.75,0.75v0.1c0,0.05,0.01,0.1,0.01,0.15l-0.01,0C11.45,4.29,11.5,5.1,11.5,5.1V6c0,2.21,1.79,4,4,4h0.9c0,0,0.01,0,0.01,0l0.02,0c0.05,0,0.1,0.01,0.15,0.01h0.1c0.41,0,0.75-0.34,0.75-0.75c0-0.26-0.14-0.5-0.35-0.61l7-3.5C24.11,5.2,24,5.1,24,5c0-0.41-0.34-0.75-0.75-0.75C23.15,4.25,12.92,3.1,12.83,3.05z"/>
            <path d="M12,18H6c-2.21,0-4-1.79-4-4v-0.9c0,0,0-0.01,0-0.01l0-0.02C2,13.05,2.01,13,2.01,13h-0.1c-0.41,0-0.75,0.34-0.75,0.75c0,0.26,0.14,0.5,0.35,0.61l3.5,7c0.2,0.4,0.66,0.54,1.06,0.35c0.04-0.02,0.07-0.04,0.1-0.06l0,0c0.6-0.59,4.35-4.24,4.35-4.24l4.24,4.24l0,0c0.02,0.02,0.06,0.04,0.1,0.06c0.4,0.2,0.86,0.05,1.06-0.35l3.5-7c0.21-0.4,0.07-0.86-0.33-1.06c-0.05-0.02-0.1-0.04-0.15-0.05h-0.1c-0.01,0-0.01,0-0.02,0l0,0.02c0,0,0,0.01,0,0.01V14c0,2.21-1.79,4-4,4H12z"/>
        </svg>
    </div>
);


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUserModel = message.role === ChatRole.USER;

  const textToHtml = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => <p key={index}>{line}</p>);
  };

  return (
    <div className={`flex items-start gap-4 my-4 ${isUserModel ? 'justify-end' : 'justify-start'}`}>
      {!isUserModel && <ModelIcon />}
      <div className={`max-w-xl rounded-2xl p-4 ${isUserModel ? 'bg-slate-100 rounded-br-none' : 'bg-white shadow-sm rounded-bl-none'}`}>
        <div className="prose prose-sm max-w-none text-slate-700">
            {textToHtml(message.text)}
        </div>
      </div>
      {isUserModel && <UserIcon />}
    </div>
  );
};

export default ChatMessage;
