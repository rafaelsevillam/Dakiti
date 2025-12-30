
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Bienvenido a Dakity. Soy tu conserje para esta noche. ¿Cómo puedo ayudarte a elevar tu experiencia?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await getGeminiChatResponse(userMessage, messages);
      setMessages(prev => [...prev, { role: 'model', text: response || "Lo siento, no pude procesar eso. ¿En qué más puedo ayudarte?" }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Tengo problemas para conectarme ahora mismo. Por favor, inténtalo de nuevo más tarde." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-surface-dark border border-surface-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Cabecera */}
          <div className="bg-primary/10 border-b border-surface-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Conserje Dakity</h3>
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider">En línea • Asistente IA</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white/10 text-white/90 rounded-tl-none border border-white/5'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                  <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Entrada */}
          <div className="p-4 bg-background-dark/50 border-t border-surface-border">
            <div className="relative flex items-center">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pregunta a tu conserje..."
                className="w-full bg-input-dark border-none rounded-full py-3 px-5 text-white text-sm placeholder:text-white/30 focus:ring-1 focus:ring-primary"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 size-8 bg-primary rounded-full text-white flex items-center justify-center hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón de alternancia */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="size-14 bg-primary rounded-full shadow-lg shadow-primary/30 text-white flex items-center justify-center glow-hover transition-all"
      >
        <span className="material-symbols-outlined text-3xl">
          {isOpen ? 'close' : 'voice_chat'}
        </span>
      </button>
    </div>
  );
};

export default AIChatbot;
