import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface NavLink {
    id: string;
    name: string;
    path: string;
    icon: string;
    order: number;
    is_active: boolean;
}

interface BrandingConfig {
    business_name: string;
    primary_color: string;
    secondary_color: string;
    logo_icon: string;
}

interface HeroConfig {
    title: string;
    subtitle: string;
    badge: string;
    image_url: string;
}

type TabType = 'nav' | 'branding' | 'content';

const SiteSettingsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('branding');
    const [links, setLinks] = useState<NavLink[]>([]);
    const [branding, setBranding] = useState<BrandingConfig>({
        business_name: '',
        primary_color: '',
        secondary_color: '',
        logo_icon: ''
    });
    const [hero, setHero] = useState<HeroConfig>({
        title: '',
        subtitle: '',
        badge: '',
        image_url: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Nav Link specific state
    const [editingLink, setEditingLink] = useState<NavLink | null>(null);
    const [isAddingLink, setIsAddingLink] = useState(false);
    const [newLink, setNewLink] = useState<Omit<NavLink, 'id'>>({
        name: '',
        path: '',
        icon: 'link',
        order: 0,
        is_active: true
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: navData } = await supabase.from('navigation_links').select('*').order('order', { ascending: true });
            setLinks(navData || []);

            const { data: configData } = await supabase.from('site_config').select('*');
            if (configData) {
                const brandingItem = configData.find(i => i.key === 'branding');
                if (brandingItem) setBranding(brandingItem.value);

                const heroItem = configData.find(i => i.key === 'hero');
                if (heroItem) setHero(heroItem.value);
            }

        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveConfig = async (key: string, value: BrandingConfig | HeroConfig) => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('site_config')
                .upsert({ key, value, updated_at: new Date().toISOString() });

            if (error) throw error;
            alert('Configuración guardada correctamente');
        } catch (error) {
            console.error(error);
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const { error } = await supabase.from('navigation_links').insert([newLink]);
            if (error) throw error;
            setIsAddingLink(false);
            setNewLink({ name: '', path: '', icon: 'link', order: 0, is_active: true });
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Error al agregar enlace');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLink) return;
        try {
            setSaving(true);
            const { error } = await supabase
                .from('navigation_links')
                .update({
                    name: editingLink.name,
                    path: editingLink.path,
                    icon: editingLink.icon,
                    order: editingLink.order,
                    is_active: editingLink.is_active
                })
                .eq('id', editingLink.id);

            if (error) throw error;
            setEditingLink(null);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Error al actualizar');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLink = async (id: string) => {
        if (!confirm('¿Eliminar este enlace de navegación?')) return;
        try {
            const { error } = await supabase.from('navigation_links').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Error al eliminar');
        }
    };

    if (loading && !links.length) {
        return <div className="p-8 text-white/40">Cargando configuración...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Ajustes del Sitio</h1>

            <div className="flex gap-4 mb-8 border-b border-surface-border pb-px">
                {[
                    { id: 'branding' as TabType, name: 'Apariencia', icon: 'palette' },
                    { id: 'content' as TabType, name: 'Contenido Hero', icon: 'auto_awesome' },
                    { id: 'nav' as TabType, name: 'Navegación', icon: 'menu' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-bold text-sm uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-white/40 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                        {tab.name}
                    </button>
                ))}
            </div>

            <div className="max-w-4xl">
                {activeTab === 'branding' && (
                    <div className="bg-surface-dark p-8 rounded-2xl border border-surface-border animate-fade-in">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">palette</span>
                            Identidad Visual
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-primary uppercase ml-1">Nombre</label>
                                <input className="bg-background-dark border border-surface-border p-4 rounded-xl text-white" value={branding.business_name} onChange={e => setBranding({ ...branding, business_name: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-primary uppercase ml-1">Icono Logo</label>
                                <input className="bg-background-dark border border-surface-border p-4 rounded-xl text-white" value={branding.logo_icon} onChange={e => setBranding({ ...branding, logo_icon: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-primary uppercase ml-1">Color Primario</label>
                                <input type="color" className="size-14 bg-transparent border-0 cursor-pointer" value={branding.primary_color} onChange={e => setBranding({ ...branding, primary_color: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-primary uppercase ml-1">Color Secundario</label>
                                <input type="color" className="size-14 bg-transparent border-0 cursor-pointer" value={branding.secondary_color} onChange={e => setBranding({ ...branding, secondary_color: e.target.value })} />
                            </div>
                        </div>
                        <button onClick={() => saveConfig('branding', branding)} disabled={saving} className="mt-8 bg-primary text-background-dark font-black px-8 py-4 rounded-xl shadow-lg shadow-primary/20">
                            {saving ? 'Guardando...' : 'Guardar Cambios Visuales'}
                        </button>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="bg-surface-dark p-8 rounded-2xl border border-surface-border animate-fade-in">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">auto_awesome</span>
                            Contenido Hero
                        </h2>
                        <div className="space-y-6">
                            <input className="w-full bg-background-dark border border-surface-border p-4 rounded-xl text-white" placeholder="Título" value={hero.title} onChange={e => setHero({ ...hero, title: e.target.value })} />
                            <textarea className="w-full bg-background-dark border border-surface-border p-4 rounded-xl text-white h-32" placeholder="Subtítulo" value={hero.subtitle} onChange={e => setHero({ ...hero, subtitle: e.target.value })} />
                            <input className="w-full bg-background-dark border border-surface-border p-4 rounded-xl text-white" placeholder="Imagen URL" value={hero.image_url} onChange={e => setHero({ ...hero, image_url: e.target.value })} />
                        </div>
                        <button onClick={() => saveConfig('hero', hero)} disabled={saving} className="mt-8 bg-primary text-background-dark font-black px-8 py-4 rounded-xl shadow-lg shadow-primary/20">
                            {saving ? 'Guardando...' : 'Guardar Contenido'}
                        </button>
                    </div>
                )}

                {activeTab === 'nav' && (
                    <div className="bg-surface-dark p-8 rounded-2xl border border-surface-border animate-fade-in">
                        <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">menu</span>
                                Menú de Navegación
                            </div>
                            <button onClick={() => { setIsAddingLink(true); setEditingLink(null); }} className="text-xs bg-primary/20 text-primary px-4 py-2 rounded-lg">+ Nuevo</button>
                        </h2>

                        {(isAddingLink || editingLink) && (
                            <div className="mb-8 p-6 bg-background-dark rounded-xl border border-primary/20">
                                <h3 className="font-bold mb-4">{editingLink ? 'Editar Enlace' : 'Nuevo Enlace'}</h3>
                                <form onSubmit={editingLink ? handleUpdateLink : handleAddLink} className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-white/40 uppercase">Nombre</label>
                                        <input className="bg-surface-dark border border-white/10 p-2 rounded text-sm" placeholder="Nombre" value={editingLink ? editingLink.name : newLink.name} onChange={e => editingLink ? setEditingLink({ ...editingLink, name: e.target.value }) : setNewLink({ ...newLink, name: e.target.value })} required />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-white/40 uppercase">Ruta</label>
                                        <input className="bg-surface-dark border border-white/10 p-2 rounded text-sm font-mono" placeholder="Ruta" value={editingLink ? editingLink.path : newLink.path} onChange={e => editingLink ? setEditingLink({ ...editingLink, path: e.target.value }) : setNewLink({ ...newLink, path: e.target.value })} required />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-white/40 uppercase">Icono</label>
                                        <input className="bg-surface-dark border border-white/10 p-2 rounded text-sm" placeholder="Icono (Material Symbol)" value={editingLink ? editingLink.icon : newLink.icon} onChange={e => editingLink ? setEditingLink({ ...editingLink, icon: e.target.value }) : setNewLink({ ...newLink, icon: e.target.value })} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-white/40 uppercase">Orden</label>
                                        <input type="number" className="bg-surface-dark border border-white/10 p-2 rounded text-sm" placeholder="Orden" value={editingLink ? editingLink.order : newLink.order} onChange={e => editingLink ? setEditingLink({ ...editingLink, order: parseInt(e.target.value) || 0 }) : setNewLink({ ...newLink, order: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2 py-2">
                                        <input type="checkbox" id="is_active" checked={editingLink ? editingLink.is_active : newLink.is_active} onChange={e => editingLink ? setEditingLink({ ...editingLink, is_active: e.target.checked }) : setNewLink({ ...newLink, is_active: e.target.checked })} className="accent-primary" />
                                        <label htmlFor="is_active" className="text-sm font-bold">Activo</label>
                                    </div>
                                    <div className="col-span-2 flex gap-4 pt-4 border-t border-white/5">
                                        <button type="submit" disabled={saving} className="bg-primary text-background-dark font-black px-6 py-2 rounded-lg text-xs hover:scale-105 transition-transform">
                                            {saving ? 'Guardando...' : editingLink ? 'Actualizar' : 'Crear Enlace'}
                                        </button>
                                        <button type="button" onClick={() => { setIsAddingLink(false); setEditingLink(null); }} className="text-white/40 text-xs font-bold hover:text-white uppercase tracking-widest">Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="space-y-4">
                            {links.length === 0 ? (
                                <p className="text-center text-white/20 py-8 italic">No hay enlaces configurados</p>
                            ) : (
                                links.map(link => (
                                    <div key={link.id} className={`bg-background-dark/50 border border-white/5 p-4 rounded-xl flex items-center justify-between transition-opacity ${!link.is_active ? 'opacity-50' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <span className="material-symbols-outlined text-primary/60">{link.icon}</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-base text-white">{link.name}</p>
                                                    {!link.is_active && <span className="text-[8px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-black uppercase">Inactivo</span>}
                                                </div>
                                                <p className="text-[10px] text-white/30 font-mono">{link.path}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right mr-4">
                                                <p className="text-[10px] text-white/20 uppercase font-black">Orden</p>
                                                <p className="font-mono font-bold text-primary">{link.order}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingLink(link); setIsAddingLink(false); }} className="size-10 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-amber-400 hover:bg-white/10 transition-all">
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button onClick={() => handleDeleteLink(link.id)} className="size-10 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-white/10 transition-all">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteSettingsView;

