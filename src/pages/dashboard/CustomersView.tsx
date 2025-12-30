import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface Customer {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    address?: string;
    created_at: string;
}

interface CustomerWithStats extends Customer {
    total_purchases: number;
    total_spent: number;
    last_purchase?: string;
}

const CustomersView: React.FC = () => {
    const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
        full_name: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);

            // Fetch customers
            const { data: customersData, error: customersError } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            if (customersError) throw customersError;

            // Fetch sales for each customer
            const { data: salesData } = await supabase
                .from('sales')
                .select('customer_id, total_amount, sale_date');

            // Calculate stats for each customer
            const customersWithStats: CustomerWithStats[] = (customersData || []).map(customer => {
                const customerSales = salesData?.filter(s => s.customer_id === customer.id) || [];
                const totalPurchases = customerSales.length;
                const totalSpent = customerSales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
                const lastPurchase = customerSales.length > 0
                    ? customerSales.sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())[0].sale_date
                    : undefined;

                return {
                    ...customer,
                    total_purchases: totalPurchases,
                    total_spent: totalSpent,
                    last_purchase: lastPurchase
                };
            });

            setCustomers(customersWithStats);
        } catch (error) {
            console.error('Error loading customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('customers')
                .insert([newCustomer]);

            if (error) throw error;

            setIsCreating(false);
            setNewCustomer({ full_name: '', email: '', phone: '', address: '' });
            fetchCustomers();
        } catch (error) {
            alert('Error creando cliente');
            console.error(error);
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsEditing(true);
        setIsCreating(false);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;

        try {
            const { error } = await supabase
                .from('customers')
                .update({
                    full_name: editingCustomer.full_name,
                    email: editingCustomer.email,
                    phone: editingCustomer.phone,
                    address: editingCustomer.address
                })
                .eq('id', editingCustomer.id);

            if (error) throw error;

            setIsEditing(false);
            setEditingCustomer(null);
            fetchCustomers();
        } catch (error) {
            alert('Error actualizando cliente');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
        try {
            const { error } = await supabase.from('customers').delete().eq('id', id);
            if (error) throw error;
            fetchCustomers();
        } catch (error) {
            console.error(error);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Gestión de Clientes</h1>
                    <p className="text-white/60 mt-1">Administra tu base de clientes</p>
                </div>
                <button
                    onClick={() => {
                        setIsCreating(true);
                        setIsEditing(false);
                    }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
                >
                    + Nuevo Cliente
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 border border-white/10 pl-12 pr-4 py-3 rounded-xl text-white placeholder-white/40 focus:border-amber-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Create Form */}
            {isCreating && (
                <div className="mb-8 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/30 animate-fade-in shadow-xl shadow-green-500/10">
                    <h2 className="text-xl font-bold mb-4 text-green-400">Agregar Cliente</h2>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            className="bg-slate-800 border border-green-500/20 p-3 rounded-lg text-white focus:border-green-500 focus:outline-none transition-colors"
                            placeholder="Nombre Completo"
                            value={newCustomer.full_name}
                            onChange={e => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            className="bg-slate-800 border border-green-500/20 p-3 rounded-lg text-white focus:border-green-500 focus:outline-none transition-colors"
                            placeholder="Email"
                            value={newCustomer.email}
                            onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                            required
                        />
                        <input
                            className="bg-slate-800 border border-green-500/20 p-3 rounded-lg text-white focus:border-green-500 focus:outline-none transition-colors"
                            placeholder="Teléfono (opcional)"
                            value={newCustomer.phone}
                            onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        />
                        <input
                            className="bg-slate-800 border border-green-500/20 p-3 rounded-lg text-white focus:border-green-500 focus:outline-none transition-colors"
                            placeholder="Dirección (opcional)"
                            value={newCustomer.address}
                            onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                        />
                        <div className="md:col-span-2 flex gap-4 mt-4">
                            <button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 py-2 rounded-lg hover:scale-105 transition-transform shadow-lg shadow-green-500/20">
                                Guardar
                            </button>
                            <button type="button" onClick={() => setIsCreating(false)} className="bg-transparent text-white/60 font-bold px-6 py-2 hover:text-white transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Form */}
            {isEditing && editingCustomer && (
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/30 animate-fade-in shadow-xl shadow-blue-500/10">
                    <h2 className="text-xl font-bold mb-4 text-blue-400">Editar Cliente</h2>
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            className="bg-slate-800 border border-blue-500/20 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Nombre Completo"
                            value={editingCustomer.full_name}
                            onChange={e => setEditingCustomer({ ...editingCustomer, full_name: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            className="bg-slate-800 border border-blue-500/20 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Email"
                            value={editingCustomer.email}
                            onChange={e => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                            required
                        />
                        <input
                            className="bg-slate-800 border border-blue-500/20 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Teléfono"
                            value={editingCustomer.phone || ''}
                            onChange={e => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                        />
                        <input
                            className="bg-slate-800 border border-blue-500/20 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Dirección"
                            value={editingCustomer.address || ''}
                            onChange={e => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                        />
                        <div className="md:col-span-2 flex gap-4 mt-4">
                            <button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-6 py-2 rounded-lg hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                                Actualizar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditingCustomer(null);
                                }}
                                className="bg-transparent text-white/60 font-bold px-6 py-2 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Customers Table */}
            <div className="bg-slate-800/50 rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Contacto</th>
                            <th className="p-4">Compras</th>
                            <th className="p-4">Total Gastado</th>
                            <th className="p-4">Última Compra</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-white/40">Cargando clientes...</td></tr>
                        ) : filteredCustomers.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-white/40">No hay clientes registrados</td></tr>
                        ) : (
                            filteredCustomers.map(customer => (
                                <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-bold text-white">{customer.full_name}</p>
                                            <p className="text-xs text-white/40">
                                                Registrado: {new Date(customer.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm">
                                            <p className="text-white/80">{customer.email}</p>
                                            {customer.phone && <p className="text-white/40 text-xs">{customer.phone}</p>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold">
                                            {customer.total_purchases} compras
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-green-400 font-bold">
                                        ${customer.total_spent.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-sm text-white/60">
                                        {customer.last_purchase
                                            ? new Date(customer.last_purchase).toLocaleDateString('es-ES')
                                            : 'Sin compras'
                                        }
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(customer)}
                                                className="text-white/40 hover:text-blue-400 transition-colors"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer.id)}
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

export default CustomersView;
