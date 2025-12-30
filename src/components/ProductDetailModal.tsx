import React, { useState } from 'react';
import { Product } from '../../types';

interface ProductDetailModalProps {
    product: Product & {
        description_full?: string;
        specs?: Record<string, string>;
        gallery?: string[];
    };
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (p: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
    const [selectedImg, setSelectedImg] = useState(product.image);

    if (!isOpen) return null;

    const images = [product.image, ...(product.gallery || [])];

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-background-dark/95 backdrop-blur-2xl" onClick={onClose}></div>

            <div className="relative w-full max-w-5xl bg-surface-dark border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl animate-zoom-in flex flex-col md:flex-row max-h-[90vh]">
                {/* Close Button Mob */}
                <button onClick={onClose} className="absolute top-6 right-6 z-20 text-white/40 hover:text-white md:hidden">
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Left: Gallery */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col gap-6 bg-black/20">
                    <div className="aspect-square rounded-3xl overflow-hidden border border-white/5 bg-background-dark/50">
                        <img src={selectedImg} className="w-full h-full object-contain p-8 animate-fade-in" alt={product.name} />
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImg(img)}
                                className={`size-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImg === img ? 'border-primary' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">{product.category}</span>
                            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{product.name}</h2>
                        </div>
                        <button onClick={onClose} className="hidden md:block text-white/40 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
                        <div className="text-3xl font-black text-white">${product.price.toFixed(2)}</div>
                        <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                            <span className="text-xs font-black">{product.rating}</span>
                        </div>
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{product.volume} • {product.abv} ABV</span>
                    </div>

                    <div className="space-y-8 mb-12">
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-primary tracking-widest mb-3">Descripción Premium</h4>
                            <p className="text-white/60 leading-relaxed">
                                {product.description_full || product.description}
                            </p>
                        </div>

                        {product.specs && Object.keys(product.specs).length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(product.specs).map(([key, val]) => (
                                    <div key={key} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[9px] text-white/40 uppercase font-black mb-1">{key}</p>
                                        <p className="text-xs font-bold text-white">{val}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            onAddToCart(product);
                            onClose();
                        }}
                        className="w-full py-6 bg-primary text-background-dark rounded-full font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined">shopping_bag</span>
                        Añadir al Carrito
                    </button>

                    <p className="text-center text-[10px] text-white/20 mt-6 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        Autenticidad Garantizada Dakity
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
