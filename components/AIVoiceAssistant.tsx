
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeBase64, encodeBase64, decodeAudioData } from '../services/geminiService';

const AIVoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
    setIsActive(false);
    setIsConnecting(false);
    setIsSpeaking(false);
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Sesión de voz abierta');
            setIsActive(true);
            setIsConnecting(false);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmData = encodeBase64(new Uint8Array(int16.buffer));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    data: pcmData,
                    mimeType: 'audio/pcm;rate=16000'
                  }
                });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            (window as any)._voiceScriptNode = scriptProcessor;
          },
          onmessage: async (message: any) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              setIsSpeaking(true);
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decodeBase64(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            
            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (err) => {
            console.error('Error en sesión de voz:', err);
            stopSession();
          },
          onclose: () => {
            console.log('Sesión de voz cerrada');
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: 'Eres el Asistente de Voz de Dakity. Eres un conserje sofisticado para una aplicación premium de vida nocturna. Sé servicial, conciso y profesional. Ayuda al usuario a encontrar bebidas o reservar servicios VIP. SIEMPRE HABLA EN ESPAÑOL.'
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error('Error al iniciar sesión de voz:', error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-center">
      <div className={`mb-4 px-4 py-2 bg-surface-dark border border-surface-border rounded-full shadow-xl transition-all duration-500 flex items-center gap-3 overflow-hidden ${isActive ? 'w-48 opacity-100' : 'w-0 opacity-0'}`}>
        <div className="flex gap-1 items-center h-4">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 bg-primary rounded-full transition-all duration-300 ${isSpeaking ? 'animate-bounce' : 'h-1 opacity-20'}`}
              style={{ animationDelay: `${i * 0.1}s`, height: isSpeaking ? '100%' : '2px' }}
            ></div>
          ))}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Conserje en Vivo</span>
      </div>

      <button
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`size-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${
          isActive 
            ? 'bg-red-500 shadow-red-500/20' 
            : 'bg-white text-background-dark shadow-white/10 hover:scale-110'
        } ${isConnecting ? 'animate-pulse' : ''}`}
      >
        <span className="material-symbols-outlined text-3xl">
          {isConnecting ? 'sync' : isActive ? 'mic_off' : 'mic'}
        </span>
      </button>
    </div>
  );
};

export default AIVoiceAssistant;
