import React, { useState } from 'react';

interface Experience {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    gallery?: string[];
}

interface ExperienceDetailModalProps {
    experience: Experience;
    isOpen: boolean;
    onClose: () => void;
}

const ExperienceDetailModal: React.FC<ExperienceDetailModalProps> = ({ experience, isOpen, onClose }) => {
    const [selectedImg, setSelectedImg] = useState(experience.image_url);

    if (!isOpen) return null;

    const images = [experience.image_url, ...(experience.gallery || [])];

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-background-dark/95 backdrop-blur-2xl" onClick={onClose}></div>

            <div className="relative w-full max-w-5xl bg-surface-dark border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl animate-zoom-in flex flex-col md:flex-row max-h-[90vh]">
                <button onClick={onClose} className="absolute top-6 right-6 z-20 text-white/40 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Left: Gallery */}
                <div className="w-full md:w-3/5 relative h-[40vh] md:h-full group">
                    <img src={selectedImg} className="w-full h-full object-cover animate-fade-in" alt={experience.title} />
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent">
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImg(img)}
                                    className={`size-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImg === img ? 'border-primary' : 'border-white/20 opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-2/5 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="mb-8">
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Experiencia Exclusiva</span>
                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-6">{experience.title}</h2>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="text-3xl font-black text-white">${experience.price.toLocaleString()}</div>
                            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Base por Persona</span>
                        </div>

                        <div className="space-y-6">
                            <p className="text-white/60 leading-relaxed text-lg italic">
                                "{experience.description}"
                            </p>

                            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Incluye</h4>
                                <ul className="space-y-2">
                                    {['Anfitrión Privado', 'Transporte Premium', 'Cata Dirigida', 'Acceso VIP'].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-sm font-bold text-white/80">
                                            <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto space-y-4">
                        <button
                            onClick={() => alert('¡Solicitud de reserva enviada! Un concierge te contactará en breve.')}
                            className="w-full py-6 bg-white text-background-dark rounded-full font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                        >
                            Reservar Ahora
                        </button>
                        <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
                            Sujeto a disponibilidad y reserva previa de 48h
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExperienceDetailModal;
