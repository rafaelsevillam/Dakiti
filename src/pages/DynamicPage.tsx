import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

interface PageContent {
    title: string;
    content: string;
    image_url?: string;
    seo_title?: string;
    seo_description?: string;
    video_url?: string;
    layout_type?: 'standard' | 'hero' | 'split';
}

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
    description: string;
}

const DynamicPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<PageContent | null>(null);
    const [embeddedProducts, setEmbeddedProducts] = useState<Record<string, Product>>({});
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('site_pages')
                .select('title, content, image_url, seo_title, seo_description, video_url, layout_type')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (data) {
                setPage(data);
                // Update SEO
                document.title = data.seo_title || `${data.title} | Dakity`;
                if (data.seo_description) {
                    const metaDesc = document.querySelector('meta[name="description"]');
                    if (metaDesc) metaDesc.setAttribute('content', data.seo_description);
                }

                // Parse for product shortcodes [product id="..."]
                const shortcodeRegex = /\[product id="([^"]+)"\]/g;
                const matches = [...data.content.matchAll(shortcodeRegex)];
                const productIds = matches.map(m => m[1]);

                if (productIds.length > 0) {
                    const { data: prods } = await supabase
                        .from('products')
                        .select('id, name, price, image_url, category, description')
                        .in('id', productIds);

                    if (prods) {
                        const prodMap: Record<string, Product> = {};
                        prods.forEach(p => prodMap[p.id] = p);
                        setEmbeddedProducts(prodMap);
                    }
                }
            }
            setLoading(false);
        };

        if (slug) fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-primary mb-6 animate-bounce">error</span>
                <h1 className="text-4xl font-black uppercase mb-4">Página no encontrada</h1>
                <p className="text-white/40 mb-10 max-w-md">Lo sentimos, la página que buscas no existe o ha sido desactivada temporalmente.</p>
                <Link to="/" className="bg-primary text-background-dark font-black px-8 py-4 rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform">Volver al Inicio</Link>
            </div>
        );
    }

    const renderVideo = () => {
        if (!page.video_url) return null;
        let embedUrl = page.video_url;

        // Simple YT/Vimeo converter
        if (embedUrl.includes('youtube.com/watch?v=')) {
            embedUrl = embedUrl.replace('watch?v=', 'embed/');
        } else if (embedUrl.includes('youtu.be/')) {
            embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/');
        } else if (embedUrl.includes('vimeo.com/')) {
            const id = embedUrl.split('/').pop();
            embedUrl = `https://player.vimeo.com/video/${id}`;
        }

        return (
            <div className="relative aspect-video w-full rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl mb-12 group">
                <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="VideoContent"
                />
            </div>
        );
    };

    const layout = page.layout_type || 'standard';

    const processContent = (html: string) => {
        let processed = html;
        const shortcodeRegex = /\[product id="([^"]+)"\]/g;

        // Note: For a strictly React way we should split into parts, 
        // but since we already use dangerouslySetInnerHTML, we can use a placeholder
        // and replace it with a DOM element after render, or use a component-based approach.
        // For now, let's keep it simple and inject a container that we might hydrate or just render as static cards if done via a dedicated renderer.

        // Better approach: return an array of elements or use a library. 
        // Given the "Improve everything" request, let's build a component-based renderer.
        return processed;
    };

    // Since we want interactive cards, we will split the content by shortcodes
    const renderContent = () => {
        if (!page) return null;

        const parts = page.content.split(/(\[product id="[^"]+"\])/g);

        return parts.map((part, index) => {
            const match = part.match(/\[product id="([^"]+)"\]/);
            if (match) {
                const prodId = match[1];
                const product = embeddedProducts[prodId];
                if (!product) return null;

                return (
                    <div key={index} className="my-12 p-1 bg-gradient-to-br from-primary/20 to-transparent rounded-[2rem] overflow-hidden group">
                        <div className="bg-surface-dark/90 backdrop-blur-xl p-6 rounded-[1.9rem] flex flex-col md:flex-row items-center gap-8">
                            <div className="size-32 rounded-2xl overflow-hidden border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500">
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">{product.category}</span>
                                <h3 className="text-2xl font-black uppercase mt-1 mb-2">{product.name}</h3>
                                <p className="text-white/40 text-sm line-clamp-2 mb-4">{product.description}</p>
                                <div className="flex items-center justify-center md:justify-start gap-6">
                                    <span className="text-2xl font-black text-white">${product.price}</span>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="bg-primary text-background-dark font-black px-6 py-2.5 rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                                    >
                                        Añadir al Carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div
                    key={index}
                    className="prose-container"
                    dangerouslySetInnerHTML={{ __html: part }}
                />
            );
        });
    };

    return (
        <div className="min-h-screen bg-background-dark text-white font-display overflow-x-hidden">
            {/* Standard/Split Banner */}
            {(layout === 'standard' || layout === 'split') && page.image_url && (
                <div className="relative h-[45vh] w-full">
                    <img src={page.image_url} alt={page.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent"></div>
                </div>
            )}

            {/* Layout: Hero */}
            {layout === 'hero' && (
                <div className="relative min-h-[95vh] flex flex-col items-center justify-center text-center px-6">
                    {page.image_url && (
                        <div className="absolute inset-0 z-0">
                            <img src={page.image_url} alt={page.title} className="w-full h-full object-cover opacity-40" />
                            <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-transparent to-background-dark"></div>
                        </div>
                    )}
                    <div className="relative z-10 max-w-5xl animate-fade-in-up">
                        <Link to="/" className="inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-12 hover:tracking-[0.6em] transition-all">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Explorar Dakity
                        </Link>
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.85] text-white">
                            {page.title}
                        </h1>
                        <div className="prose prose-invert prose-primary max-w-2xl mx-auto text-white/60 text-lg md:text-xl font-light mb-16">
                            {renderContent()}
                        </div>
                        {page.video_url && <div className="max-w-4xl mx-auto">{renderVideo()}</div>}
                    </div>
                </div>
            )}

            {/* Layout: Standard / Split */}
            {layout !== 'hero' && (
                <div className={`max-w-6xl mx-auto px-6 py-20 ${page.image_url ? '-mt-32 relative z-10' : ''}`}>
                    <div className={layout === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-20 items-start' : 'max-w-4xl mx-auto'}>
                        <div className="animate-fade-in">
                            <Link to="/" className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-16 hover:gap-4 transition-all w-fit bg-white/5 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10 shadow-2xl">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Volver al Inicio
                            </Link>

                            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-16 bg-gradient-to-br from-white via-white to-white/20 bg-clip-text text-transparent leading-[0.9]">
                                {page.title}
                            </h1>

                            {layout === 'standard' && renderVideo()}

                            <div
                                className="prose prose-xl prose-invert prose-primary max-w-none text-white/70 leading-relaxed font-light content-renderer"
                                dangerouslySetInnerHTML={{ __html: page.content }}
                            />
                        </div>

                        {layout === 'split' && (
                            <div className="lg:sticky lg:top-20 animate-fade-in-right">
                                {renderVideo()}
                                {!page.video_url && page.image_url && (
                                    <div className="rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl -rotate-2 hover:rotate-0 transition-transform duration-1000">
                                        <img src={page.image_url} alt="Side Content" className="w-full h-auto" />
                                    </div>
                                )}
                                <div className="mt-10 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                                    <h4 className="text-primary font-black uppercase tracking-widest text-xs mb-4">Descubre Más</h4>
                                    <p className="text-white/40 text-sm leading-relaxed">Explora nuestras colecciones exclusivas y vive la experiencia Dakity al máximo.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer space */}
            <div className="h-60 bg-gradient-to-t from-primary/10 to-transparent mt-20"></div>
        </div>
    );
};

export default DynamicPage;
