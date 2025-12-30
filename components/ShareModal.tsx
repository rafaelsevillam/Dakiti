
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CartItem } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, cartItems }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [caption, setCaption] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateCaption();
    }
  }, [isOpen]);

  const generateCaption = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const prompt = `Genera un pie de foto para redes sociales que sea elegante, corto e impactante para una aplicación de entrega nocturna llamada Dakity. 
      El usuario está viendo ${cartItems.length > 0 ? 'su carrito que contiene: ' + cartItems.map(i => i.name).join(', ') : 'la colección premium'}. 
      Haz que suene exclusivo y emocionante. Usa 2-3 emojis. Máximo 15 palabras. RESPONDE SIEMPRE EN ESPAÑOL.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      setCaption(response.text || "Eleva tu noche con Dakity. Licores premium, entrega al instante. 🍸🔥");
    } catch (err) {
      console.error(err);
      setCaption("Eleva tu noche con Dakity. Servicio exclusivo para los más audaces. 🥂✨");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: 'Dakity - Entrega Premium para Vida Nocturna',
      text: caption,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error compartiendo', err);
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${caption} \n\nDescubre Dakity: ${window.location.href}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-surface-dark border border-surface-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in">
        {/* Cabecera */}
        <div className="p-8 pb-4 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tighter">Comparte la Vibra</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tarjeta de Previsualización */}
        <div className="px-8 pb-8">
          <div className="relative aspect-[4/5] bg-gradient-to-br from-[#482345] to-[#221020] rounded-3xl border border-white/5 overflow-hidden flex flex-col p-8 shadow-inner">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary blur-[100px]"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500 blur-[100px]"></div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
              <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-6 animate-pulse">
                <span className="material-symbols-outlined text-4xl">celebration</span>
              </div>
              <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white mb-2">Dakity</h3>
              <div className="h-px w-12 bg-primary/40 mb-6"></div>
              
              {isGenerating ? (
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-white/5 rounded-full animate-pulse mx-auto"></div>
                  <div className="h-4 w-32 bg-white/5 rounded-full animate-pulse mx-auto"></div>
                </div>
              ) : (
                <p className="text-white text-lg font-medium leading-relaxed max-w-[80%] mx-auto">
                  "{caption}"
                </p>
              )}
            </div>

            <div className="mt-auto relative z-10 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center gap-4">
              <div className="size-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-background-dark">qr_code_2</span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Escanea para unirte</p>
                <p className="text-xs text-white/60 truncate">dakity.app/invitacion/vibe</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-8 space-y-4">
            <div className="flex gap-4">
              <button 
                onClick={handleNativeShare}
                className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-sm">ios_share</span>
                Compartir
              </button>
              <button 
                onClick={copyToClipboard}
                className="size-12 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Copiar Enlace"
              >
                <span className="material-symbols-outlined text-lg">
                  {copySuccess ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
            <p className="text-center text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">
              Difunde la experiencia de lujo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
