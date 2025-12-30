import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface Product {
    id: string;
    name: string;
    description: string;
    description_full: string;
    sku: string;
    price: number;
    old_price: number | null;
    stock: number;
    category: string;
    image: string;
    gallery: string[];
    specs: any[];
    rating: number;
    reviews: number;
    volume: string;
    abv: string;
    origin: string;
}

interface Category {
    slug: string;
    name: string;
}

const InventoryView: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form State
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        name: '',
        sku: '',
        category: '',
        price: 0,
        old_price: null,
        stock: 0,
        description: '',
        description_full: '',
        image: '',
        gallery: [],
        specs: [],
        volume: '',
        abv: '',
        origin: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch Categories for dropdown
            const { data: catData } = await supabase
                .from('categories')
                .select('slug, name')
                .order('order', { ascending: true });

            setCategories(catData || []);

            // Fetch Products
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name');

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error loading inventory data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Clean up data: empty SKU should be null to avoid unique constraint violation
            const productToInsert = {
                ...newProduct,
                sku: newProduct.sku?.trim() === '' ? null : newProduct.sku?.trim()
            };

            const { error } = await supabase
                .from('products')
                .insert([productToInsert]);

            if (error) throw error;

            setIsCreating(false);
            setNewProduct({
                name: '', sku: '', category: '', price: 0, old_price: null,
                stock: 0, description: '', description_full: '', image: '', gallery: [], specs: [], volume: '', abv: '', origin: ''
            });
            fetchData();
        } catch (error: any) {
            alert(`Error al crear producto: ${error.message || 'Error desconocido'}`);
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsEditing(true);
        setIsCreating(false);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            const { error } = await supabase
                .from('products')
                .update({
                    name: editingProduct.name,
                    sku: editingProduct.sku?.trim() === '' ? null : editingProduct.sku?.trim(),
                    category: editingProduct.category,
                    price: editingProduct.price,
                    old_price: editingProduct.old_price,
                    stock: editingProduct.stock,
                    description: editingProduct.description,
                    description_full: editingProduct.description_full,
                    image: editingProduct.image,
                    gallery: editingProduct.gallery,
                    specs: editingProduct.specs,
                    volume: editingProduct.volume,
                    abv: editingProduct.abv,
                    origin: editingProduct.origin
                })
                .eq('id', editingProduct.id);

            if (error) throw error;

            setIsEditing(false);
            setEditingProduct(null);
            fetchData();
        } catch (error: any) {
            alert(`Error al actualizar producto: ${error.message || 'Error desconocido'}`);
            console.error(error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase tracking-tight">Inventario</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-primary text-background-dark font-bold px-6 py-3 rounded-xl hover:bg-white transition-colors"
                >
                    + Nuevo Producto
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 p-6 bg-surface-dark rounded-2xl border border-primary/20 animate-fade-in">
                    <h2 className="text-xl font-bold mb-4">Agregar Producto</h2>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Nombre del Producto</label>
                            <input
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white"
                                placeholder="Ej: Don Julio 1942"
                                value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                            />
                            <p className="text-[9px] text-white/40 ml-2">El nombre comercial que verá el cliente.</p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Categoría</label>
                            <select
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white"
                                value={newProduct.category}
                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar Categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                            <p className="text-[9px] text-white/40 ml-2">Agrupa tus productos para que sean fáciles de encontrar.</p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">URL de Imagen</label>
                            <input
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white"
                                placeholder="Link de la foto"
                                value={newProduct.image}
                                onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                            />
                            <p className="text-[9px] text-white/40 ml-2">Preferiblemente enlace de Unsplash o CDN con fondo transparente.</p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Código SKU</label>
                            <input
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white"
                                placeholder="Ej: TEQ-DJ-1942"
                                value={newProduct.sku}
                                onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                            />
                            <p className="text-[9px] text-white/40 ml-2">identificador único interno (Opcional).</p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Presentación / Volumen</label>
                            <input
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white"
                                placeholder="ej: 750ml"
                                value={newProduct.volume}
                                onChange={e => setNewProduct({ ...newProduct, volume: e.target.value })}
                            />
                            <p className="text-[9px] text-white/40 ml-2">Tamaño de la botella o paquete.</p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Porcentaje de Alcohol</label>
                            <input
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white"
                                placeholder="ej: 40%"
                                value={newProduct.abv}
                                onChange={e => setNewProduct({ ...newProduct, abv: e.target.value })}
                            />
                            <p className="text-[9px] text-white/40 ml-2">Grado alcohólico (ABV).</p>
                        </div>

                        <div className="flex flex-col gap-1 text-white">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Precio Actual</label>
                            <input
                                type="number"
                                className="bg-background-dark border border-surface-border p-3 rounded-lg"
                                placeholder="Precio"
                                value={newProduct.price}
                                onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                                required
                            />
                            <p className="text-[9px] text-white/40 ml-2">Valor de venta al público en la moneda local.</p>
                        </div>

                        <div className="flex flex-col gap-1 text-white">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Stock Disponible</label>
                            <input
                                type="number"
                                className="bg-background-dark border border-surface-border p-3 rounded-lg"
                                placeholder="Stock Inicial"
                                value={newProduct.stock}
                                onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                                required
                            />
                            <p className="text-[9px] text-white/40 ml-2">Cantidad de unidades en bodega.</p>
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Descripción Corta (Catálogo)</label>
                            <textarea
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white"
                                placeholder="Breve resumen..."
                                value={newProduct.description}
                                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Descripción Completa (Detalle)</label>
                            <textarea
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white h-32"
                                placeholder="Toda la historia y notas de cata..."
                                value={newProduct.description_full}
                                onChange={e => setNewProduct({ ...newProduct, description_full: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Galería de Fotos (URLs separadas por comas)</label>
                            <textarea
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white font-mono text-xs"
                                placeholder="url1, url2, url3..."
                                value={newProduct.gallery?.join(', ')}
                                onChange={e => setNewProduct({ ...newProduct, gallery: e.target.value.split(',').map(u => u.trim()).filter(u => u !== '') })}
                            />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary uppercase ml-2">Especificaciones Técnicas (JSON)</label>
                            <textarea
                                className="bg-background-dark border border-surface-border p-3 rounded-lg text-white font-mono text-xs"
                                placeholder='[{"label": "Madurez", "value": "Añejo"}]'
                                value={JSON.stringify(newProduct.specs || [])}
                                onChange={e => {
                                    try {
                                        setNewProduct({ ...newProduct, specs: JSON.parse(e.target.value) });
                                    } catch (err) {
                                        // Silent error until blur or similar
                                    }
                                }}
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-4 mt-4">
                            <button type="submit" className="bg-primary text-background-dark font-bold px-6 py-2 rounded-lg">Guardar Producto</button>
                            <button type="button" onClick={() => setIsCreating(false)} className="bg-transparent text-white/60 font-bold px-6 py-2">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Product Form */}
            {isEditing && editingProduct && (
                <div className="mb-8 p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30 animate-fade-in shadow-xl shadow-amber-500/10">
                    <h2 className="text-xl font-bold mb-4 text-amber-400">Editar Producto</h2>
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                            placeholder="Nombre del Producto"
                            value={editingProduct.name}
                            onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            required
                        />
                        <input
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                            placeholder="SKU"
                            value={editingProduct.sku}
                            onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        />
                        <select
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                            value={editingProduct.category}
                            onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            required
                        >
                            <option value="">Seleccionar Categoría</option>
                            {categories.map(cat => (
                                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                        <input
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                            placeholder="URL de la Imagen"
                            value={editingProduct.image}
                            onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        />
                        <input
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                            placeholder="Volumen"
                            value={editingProduct.volume}
                            onChange={e => setEditingProduct({ ...editingProduct, volume: e.target.value })}
                        />
                        <input
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                            placeholder="ABV"
                            value={editingProduct.abv}
                            onChange={e => setEditingProduct({ ...editingProduct, abv: e.target.value })}
                        />
                        <input
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                            placeholder="Origen"
                            value={editingProduct.origin}
                            onChange={e => setEditingProduct({ ...editingProduct, origin: e.target.value })}
                        />
                        <input
                            type="number"
                            step="0.01"
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                            placeholder="Precio"
                            value={editingProduct.price}
                            onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                            required
                        />
                        <input
                            type="number"
                            step="0.01"
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                            placeholder="Precio Anterior"
                            value={editingProduct.old_price || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, old_price: e.target.value ? parseFloat(e.target.value) : null })}
                        />
                        <input
                            type="number"
                            className="bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                            placeholder="Stock"
                            value={editingProduct.stock}
                            onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                            required
                        />
                        <textarea
                            className="md:col-span-2 bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                            placeholder="Descripción Corta"
                            value={editingProduct.description}
                            onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        />
                        <textarea
                            className="md:col-span-2 bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors h-32"
                            placeholder="Descripción Completa"
                            value={editingProduct.description_full}
                            onChange={e => setEditingProduct({ ...editingProduct, description_full: e.target.value })}
                        />
                        <textarea
                            className="md:col-span-2 bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors font-mono text-xs"
                            placeholder="Galería (URLs separadas por comas)"
                            value={editingProduct.gallery?.join(', ')}
                            onChange={e => setEditingProduct({ ...editingProduct, gallery: e.target.value.split(',').map(u => u.trim()).filter(u => u !== '') })}
                        />
                        <textarea
                            className="md:col-span-2 bg-slate-800 border border-amber-500/20 p-3 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors font-mono text-xs"
                            placeholder='Especificaciones (JSON) ej: [{"label": "A", "value": "B"}]'
                            value={JSON.stringify(editingProduct.specs)}
                            onChange={e => {
                                try {
                                    setEditingProduct({ ...editingProduct, specs: JSON.parse(e.target.value) });
                                } catch (err) { }
                            }}
                        />
                        <div className="md:col-span-2 flex gap-4 mt-4">
                            <button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-2 rounded-lg hover:scale-105 transition-transform shadow-lg shadow-amber-500/20">
                                Actualizar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditingProduct(null);
                                }}
                                className="bg-transparent text-white/60 font-bold px-6 py-2 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-surface-dark rounded-2xl border border-surface-border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">SKU</th>
                            <th className="p-4">Producto</th>
                            <th className="p-4">Categoría</th>
                            <th className="p-4">Precio</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-white/40">Cargando inventario...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-white/40">No hay productos registrados</td></tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-sm text-white/60">{product.sku || '-'}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {product.image && (
                                                <div className="size-10 bg-white/5 rounded-lg overflow-hidden border border-white/10 p-1 flex items-center justify-center">
                                                    <img src={product.image} className="max-w-full max-h-full object-contain" alt="" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold">{product.name}</p>
                                                <p className="text-[10px] text-white/40 uppercase tracking-wider">{product.volume} • {product.origin}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-white/60 text-sm">
                                            {categories.find(c => c.slug === product.category)?.name || product.category || 'General'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-primary">${product.price?.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 10 ? 'bg-green-500/20 text-green-400' :
                                            product.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            {product.stock} un.
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-white/40 hover:text-amber-400 transition-colors"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-white/40 hover:text-red-400 transition-colors"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryView;
