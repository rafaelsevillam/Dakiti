import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface Experience {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    gallery: string[];
    is_active: boolean;
    order: number;
}

const ExperiencesView: React.FC = () => {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingExp, setEditingExp] = useState<Experience | null>(null);

    const [newExp, setNewExp] = useState<Partial<Experience>>({
        title: '',
        description: '',
        price: 0,
        image_url: '',
        gallery: [],
        is_active: true,
        order: 0
    });

    const fetchExperiences = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('experiences')
                .select('*')
                .order('order', { ascending: true });

            if (error) throw error;
            setExperiences(data || []);
        } catch (error) {
            console.error('Error loading experiences:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('experiences')
                .insert([newExp]);

            if (error) throw error;
            setIsCreating(false);
            setNewExp({ title: '', description: '', price: 0, image_url: '', gallery: [], is_active: true, order: 0 });
            fetchExperiences();
        } catch (error) {
            alert('Error creando experiencia');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta experiencia?')) return;
        try {
            const { error } = await supabase
                .from('experiences')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchExperiences();
        } catch (error) {
            alert('Error eliminando experiencia');
            console.error(error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingExp) return;
        try {
            const { error } = await supabase
                .from('experiences')
                .update({
                    title: editingExp.title,
                    description: editingExp.description,
                    price: editingExp.price,
                    image_url: editingExp.image_url,
                    gallery: editingExp.gallery,
                    is_active: editingExp.is_active,
                    order: editingExp.order
                })
                .eq('id', editingExp.id);

            if (error) throw error;
            setEditingExp(null);
            fetchExperiences();
        } catch (error) {
            alert('Error actualizando experiencia');
            console.error(error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase tracking-tight">Experiencias VIP</h1>
                <button
                    onClick={() => {
                        setIsCreating(true);
                        setEditingExp(null);
                    }}
                    className="bg-primary text-background-dark font-bold px-6 py-3 rounded-xl hover:bg-white transition-colors"
                >
                    + Nueva Experiencia
                </button>
            </div>

            {(isCreating || editingExp) && (
                <div className={`mb-8 p-6 rounded-2xl border animate-fade-in shadow-2xl ${editingExp ? 'bg-purple-500/10 border-purple-500/30' : 'bg-surface-dark border-primary/20'}`}>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">{editingExp ? 'edit' : 'add_circle'}</span>
                        {editingExp ? 'Editar Experiencia' : 'Crear Experiencia'}
                    </h2>
                    <form onSubmit={editingExp ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-primary uppercase ml-2">Título</label>
                            <input
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white focus:border-primary outline-none transition-all"
                                placeholder="Ej: Noche de Gala"
                                value={editingExp ? editingExp.title : newExp.title}
                                onChange={e => editingExp ? setEditingExp({ ...editingExp, title: e.target.value }) : setNewExp({ ...newExp, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-primary uppercase ml-2">Precio</label>
                            <input
                                type="number"
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white focus:border-primary outline-none transition-all"
                                value={editingExp ? editingExp.price : newExp.price}
                                onChange={e => editingExp ? setEditingExp({ ...editingExp, price: parseFloat(e.target.value) }) : setNewExp({ ...newExp, price: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-[10px] font-bold text-primary uppercase ml-2">Descripción</label>
                            <textarea
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white focus:border-primary outline-none transition-all h-24"
                                value={editingExp ? editingExp.description : newExp.description}
                                onChange={e => editingExp ? setEditingExp({ ...editingExp, description: e.target.value }) : setNewExp({ ...newExp, description: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-primary uppercase ml-2">URL Imagen</label>
                            <input
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white focus:border-primary outline-none transition-all"
                                value={editingExp ? editingExp.image_url : newExp.image_url}
                                onChange={e => editingExp ? setEditingExp({ ...editingExp, image_url: e.target.value }) : setNewExp({ ...newExp, image_url: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-[10px] font-bold text-primary uppercase ml-2">Galería (URLs separadas por coma)</label>
                            <textarea
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white focus:border-primary outline-none transition-all h-20 font-mono text-xs"
                                placeholder="https://..., https://..."
                                value={editingExp ? editingExp.gallery?.join(', ') : newExp.gallery?.join(', ')}
                                onChange={e => {
                                    const urls = e.target.value.split(',').map(u => u.trim()).filter(u => u !== '');
                                    editingExp ? setEditingExp({ ...editingExp, gallery: urls }) : setNewExp({ ...newExp, gallery: urls });
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-primary uppercase ml-2">Orden</label>
                            <input
                                type="number"
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white focus:border-primary outline-none transition-all"
                                value={editingExp ? editingExp.order : newExp.order}
                                onChange={e => editingExp ? setEditingExp({ ...editingExp, order: parseInt(e.target.value) }) : setNewExp({ ...newExp, order: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-4 mt-4">
                            <button type="submit" className="bg-primary text-background-dark font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20">
                                {editingExp ? 'Actualizar' : 'Guardar'}
                            </button>
                            <button type="button" onClick={() => { setIsCreating(false); setEditingExp(null); }} className="bg-transparent text-white/60 font-bold px-6 py-2">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-white/40 p-8">Cargando experiencias...</p>
                ) : experiences.map(exp => (
                    <div key={exp.id} className="bg-surface-dark border border-surface-border rounded-2xl overflow-hidden group hover:border-primary/40 transition-all">
                        <div className="aspect-video relative overflow-hidden">
                            <img src={exp.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={exp.title} />
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-primary font-black text-xs">
                                ${exp.price.toLocaleString()}
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-2">{exp.title}</h3>
                            <p className="text-white/40 text-sm line-clamp-2 mb-4">{exp.description}</p>
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Posición: {exp.order}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingExp(exp); setIsCreating(false); }} className="text-white/40 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(exp.id)} className="text-white/40 hover:text-red-400 transition-colors">
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExperiencesView;
