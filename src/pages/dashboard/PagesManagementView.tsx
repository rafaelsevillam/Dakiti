import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface SitePage {
    id: string;
    slug: string;
    title: string;
    content: string;
    image_url?: string;
    seo_title?: string;
    seo_description?: string;
    video_url?: string;
    layout_type?: 'standard' | 'hero' | 'split';
    is_active: boolean;
    updated_at: string;
}

const PagesManagementView: React.FC = () => {
    const [pages, setPages] = useState<SitePage[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPage, setEditingPage] = useState<SitePage | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('site_pages')
            .select('*')
            .order('updated_at', { ascending: false });

        if (data) setPages(data);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: any = {
            slug: (formData.get('slug') as string).toLowerCase().replace(/\s+/g, '-'),
            title: formData.get('title') as string,
            content: formData.get('content') as string,
            image_url: formData.get('image_url') as string,
            seo_title: formData.get('seo_title') as string,
            seo_description: formData.get('seo_description') as string,
            video_url: formData.get('video_url') as string,
            layout_type: formData.get('layout_type') as string,
            is_active: formData.get('is_active') === 'on',
            updated_at: new Date().toISOString()
        };

        if (editingPage) {
            await supabase.from('site_pages').update(data).eq('id', editingPage.id);
        } else {
            await supabase.from('site_pages').insert([data]);
        }

        setIsCreating(false);
        setEditingPage(null);
        fetchPages();
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar esta página permanentemente?')) {
            await supabase.from('site_pages').delete().eq('id', id);
            fetchPages();
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Páginas Dinámicas</h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Crea contenido para tus enlaces de navegación</p>
                </div>
                <button onClick={() => setIsCreating(true)} className="bg-primary text-background-dark font-black px-6 py-2 rounded-lg text-xs hover:scale-105 transition-transform">+ Nueva Página</button>
            </div>

            {(isCreating || editingPage) && (
                <div className="bg-surface-dark p-8 rounded-[2rem] border border-primary/20 mb-10 animate-fade-in shadow-2xl">
                    <h2 className="text-xl font-bold mb-6">{editingPage ? 'Editar Página' : 'Crear Nueva Página'}</h2>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-primary ml-1">Título de la Página</label>
                                <input name="title" defaultValue={editingPage?.title} placeholder="Ej: Nuestra Galería" className="bg-background-dark border border-white/5 p-4 rounded-xl text-white outline-none focus:border-primary/50 transition-colors" required />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-primary ml-1">Slug (URL)</label>
                                <div className="flex items-center gap-2 bg-background-dark border border-white/5 p-4 rounded-xl">
                                    <span className="text-white/20 text-sm">/p/</span>
                                    <input name="slug" defaultValue={editingPage?.slug} placeholder="galeria" className="bg-transparent text-white outline-none w-full text-sm" required />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-primary ml-1">Imagen de Cabecera (URL)</label>
                                <input name="image_url" defaultValue={editingPage?.image_url} placeholder="https://images.unsplash.com/..." className="bg-background-dark border border-white/5 p-4 rounded-xl text-white outline-none focus:border-primary/50 transition-colors" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-primary ml-1">Plantilla de Diseño (Layout)</label>
                                <select name="layout_type" defaultValue={editingPage?.layout_type || 'standard'} className="bg-background-dark border border-white/5 p-4 rounded-xl text-white outline-none focus:border-primary/50 transition-colors appearance-none">
                                    <option value="standard">Estándar (Centrado)</option>
                                    <option value="hero">Impacto (Hero Full)</option>
                                    <option value="split">Dividido (Split View)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-primary ml-1">Video Relacionado (YT/Vimeo URL)</label>
                                <input name="video_url" defaultValue={editingPage?.video_url} placeholder="https://youtube.com/watch?v=..." className="bg-background-dark border border-white/5 p-4 rounded-xl text-white outline-none focus:border-primary/50 transition-colors" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-primary ml-1">Título SEO</label>
                                <input name="seo_title" defaultValue={editingPage?.seo_title} placeholder="Título para buscadores..." className="bg-background-dark border border-white/5 p-4 rounded-xl text-white outline-none focus:border-primary/50 transition-colors" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-primary ml-1">Descripción SEO (Meta Description)</label>
                            <textarea name="seo_description" defaultValue={editingPage?.seo_description} rows={2} placeholder="Resumen corto para Google..." className="bg-background-dark border border-white/5 p-4 rounded-xl text-white outline-none focus:border-primary/50 transition-colors resize-none" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-primary ml-1">Contenido (HTML/Texto)</label>
                            <textarea name="content" defaultValue={editingPage?.content} placeholder="Escribe aquí el contenido de la página..." className="bg-background-dark border border-white/5 p-4 rounded-xl text-white outline-none focus:border-primary/50 transition-colors h-64 font-mono text-sm" required />
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input name="is_active" type="checkbox" defaultChecked={editingPage?.is_active ?? true} className="sr-only peer" />
                                    <div className="w-10 h-6 bg-white/5 rounded-full peer peer-checked:bg-primary transition-colors"></div>
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full peer-checked:translate-x-4 peer-checked:bg-background-dark transition-all"></div>
                                </div>
                                <span className="text-sm font-bold text-white/40 group-hover:text-white transition-colors">Página Activa</span>
                            </label>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => { setIsCreating(false); setEditingPage(null); }} className="text-white/40 text-xs font-bold uppercase hover:text-white transition-colors">Cancelar</button>
                                <button type="submit" className="bg-primary text-background-dark font-black px-8 py-3 rounded-xl text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-transform">Guardar Cambios</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {pages.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <span className="material-symbols-outlined text-4xl text-white/10 mb-4">description</span>
                        <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No hay páginas dinámicas creadas</p>
                    </div>
                )}
                {pages.map(page => (
                    <div key={page.id} className={`bg-surface-dark border border-white/5 p-6 rounded-2xl flex items-center justify-between group transition-all ${!page.is_active ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">page_control</span>
                            </div>
                            <div>
                                <h3 className="font-bold">{page.title}</h3>
                                <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                                    <span>/p/{page.slug}</span>
                                    <span>•</span>
                                    <span>Actualizado {new Date(page.updated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setEditingPage(page)} className="size-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all">
                                <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button onClick={() => handleDelete(page.id)} className="size-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all">
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PagesManagementView;
