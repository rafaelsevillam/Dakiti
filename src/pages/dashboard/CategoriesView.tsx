import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface Category {
    id: string;
    slug: string;
    name: string;
    icon: string;
    order: number;
}

const CategoriesView: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [newCategory, setNewCategory] = useState<Partial<Category>>({
        name: '',
        slug: '',
        icon: 'local_bar',
        order: 0
    });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('order', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('categories')
                .insert([newCategory]);

            if (error) throw error;
            setIsCreating(false);
            setNewCategory({ name: '', slug: '', icon: 'local_bar', order: 0 });
            fetchCategories();
        } catch (error) {
            alert('Error creando categoría');
            console.error(error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        try {
            const { error } = await supabase
                .from('categories')
                .update({
                    name: editingCategory.name,
                    slug: editingCategory.slug,
                    icon: editingCategory.icon,
                    order: editingCategory.order
                })
                .eq('id', editingCategory.id);

            if (error) throw error;
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            alert('Error actualizando categoría');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase tracking-tight">Categorías</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-primary text-background-dark font-bold px-6 py-3 rounded-xl hover:bg-white transition-colors"
                >
                    + Nueva Categoría
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 p-6 bg-surface-dark rounded-2xl border border-primary/20">
                    <h2 className="text-xl font-bold mb-4">Nueva Categoría</h2>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Nombre de Categoría</label>
                            <input
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white"
                                placeholder="Nombre (ej: Licores)"
                                value={newCategory.name}
                                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                required
                            />
                            <p className="text-[9px] text-white/40 ml-2">Nombre visible en los filtros de la tienda.</p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Slug (Identificador)</label>
                            <input
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white"
                                placeholder="Slug (ej: liquor)"
                                value={newCategory.slug}
                                onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })}
                                required
                            />
                            <p className="text-[9px] text-white/40 ml-2">Identificador único sin espacios (ej: vinos-tintos).</p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Icono (Material Symbol)</label>
                            <input
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white"
                                placeholder="Icon ID (ej: local_bar)"
                                value={newCategory.icon}
                                onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })}
                            />
                            <p className="text-[9px] text-white/40 ml-2">Nombre del icono decorativo.</p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Orden de Visualización</label>
                            <input
                                type="number"
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white"
                                placeholder="Orden"
                                value={newCategory.order}
                                onChange={e => setNewCategory({ ...newCategory, order: parseInt(e.target.value) })}
                            />
                            <p className="text-[9px] text-white/40 ml-2">Prioridad de aparición (1 es primero).</p>
                        </div>
                        <div className="md:col-span-2 flex gap-4 mt-4">
                            <button type="submit" className="bg-primary text-background-dark font-bold px-6 py-2 rounded-lg">Crear Categoría</button>
                            <button type="button" onClick={() => setIsCreating(false)} className="bg-transparent text-white/60 font-bold px-6 py-2">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {editingCategory && (
                <div className="mb-8 p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30 shadow-xl">
                    <h2 className="text-xl font-bold mb-4 text-amber-400">Editar Categoría</h2>
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                            placeholder="Nombre"
                            value={editingCategory.name}
                            onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            required
                        />
                        <input
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                            placeholder="Slug"
                            value={editingCategory.slug}
                            onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                            required
                        />
                        <input
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                            placeholder="Icon ID"
                            value={editingCategory.icon}
                            onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        />
                        <input
                            type="number"
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                            placeholder="Orden"
                            value={editingCategory.order}
                            onChange={e => setEditingCategory({ ...editingCategory, order: parseInt(e.target.value) })}
                        />
                        <div className="md:col-span-2 flex gap-4 mt-4">
                            <button type="submit" className="bg-amber-500 text-white font-bold px-6 py-2 rounded-lg shadow-lg">Actualizar</button>
                            <button type="button" onClick={() => setEditingCategory(null)} className="bg-transparent text-white/60 font-bold px-6 py-2">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-surface-dark rounded-2xl border border-surface-border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Orden</th>
                            <th className="p-4">Icono</th>
                            <th className="p-4">Nombre</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-white/40">Cargando categorías...</td></tr>
                        ) : categories.map(cat => (
                            <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-white/40">{cat.order}</td>
                                <td className="p-4">
                                    <span className="material-symbols-outlined">{cat.icon}</span>
                                </td>
                                <td className="p-4 font-bold">{cat.name}</td>
                                <td className="p-4 text-white/60 font-mono text-xs">{cat.slug}</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => setEditingCategory(cat)} className="text-white/40 hover:text-amber-400"><span className="material-symbols-outlined text-lg">edit</span></button>
                                        <button onClick={() => handleDelete(cat.id)} className="text-white/40 hover:text-red-400"><span className="material-symbols-outlined text-lg">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoriesView;
