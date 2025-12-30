import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
}

interface Customer {
    id: string;
    full_name: string;
    email: string;
}

interface SaleItem {
    product_id: string;
    quantity: number;
    unit_price: number;
}

interface Sale {
    id: string;
    sale_date: string;
    total_amount: number;
    customer_id: string;
    status: 'pending' | 'completed' | 'cancelled';
    payment_status: 'unpaid' | 'paid';
    notes?: string;
    created_by?: string;
    customers?: { full_name: string };
}

const SalesView: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingSale, setIsCreatingSale] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { user } = useAuth();

    // Filters
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPayment, setFilterPayment] = useState<string>('all');

    // Metrics
    const [todaySales, setTodaySales] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [salesCount, setSalesCount] = useState(0);

    // New Sale Form
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
    const [currentItem, setCurrentItem] = useState({ product_id: '', quantity: 1 });
    const [newSaleNotes, setNewSaleNotes] = useState('');

    useEffect(() => {
        fetchData();
    }, [filterStatus, filterPayment]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch products
            const { data: productsData } = await supabase
                .from('products')
                .select('id, name, price, stock')
                .order('name');
            setProducts(productsData || []);

            // Fetch customers
            const { data: customersData } = await supabase
                .from('customers')
                .select('id, full_name, email')
                .order('full_name');
            setCustomers(customersData || []);

            // Build query for sales
            let query = supabase
                .from('sales')
                .select('*, customers(full_name)')
                .order('sale_date', { ascending: false });

            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }
            if (filterPayment !== 'all') {
                query = query.eq('payment_status', filterPayment);
            }

            const { data: salesData } = await query.limit(50);
            setSales(salesData || []);

            // Calculate metrics (from all sales, not just filtered)
            const { data: allSalesData } = await supabase.from('sales').select('total_amount, sale_date');

            if (allSalesData) {
                const today = new Date().toISOString().split('T')[0];
                const todayTotal = allSalesData
                    .filter(s => s.sale_date?.startsWith(today))
                    .reduce((sum, s) => sum + Number(s.total_amount || 0), 0);

                const allTotal = allSalesData.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);

                setTodaySales(todayTotal);
                setTotalSales(allTotal);
                setSalesCount(allSalesData.length);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addItemToSale = () => {
        if (!currentItem.product_id || currentItem.quantity <= 0) return;

        const product = products.find(p => p.id === currentItem.product_id);
        if (!product) return;

        // Validate stock availability
        if (product.stock < currentItem.quantity) {
            alert(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles de ${product.name}`);
            return;
        }

        setSaleItems([...saleItems, {
            product_id: currentItem.product_id,
            quantity: currentItem.quantity,
            unit_price: product.price
        }]);

        setCurrentItem({ product_id: '', quantity: 1 });
    };

    const removeItem = (index: number) => {
        setSaleItems(saleItems.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return saleItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const handleCreateSale = async () => {
        if (!selectedCustomer || saleItems.length === 0) {
            alert('Selecciona un cliente y agrega al menos un producto');
            return;
        }

        try {
            setLoading(true);
            const total = calculateTotal();

            // Create sale
            const { data: saleData, error: saleError } = await supabase
                .from('sales')
                .insert([{
                    customer_id: selectedCustomer,
                    total_amount: total,
                    status: 'pending',
                    payment_status: 'unpaid',
                    notes: newSaleNotes,
                    created_by: user?.id
                }])
                .select()
                .single();

            if (saleError) throw saleError;

            // Create sale items
            const itemsToInsert = saleItems.map(item => ({
                sale_id: saleData.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price
            }));

            const { error: itemsError } = await supabase
                .from('sale_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            // Update stock
            for (const item of saleItems) {
                const product = products.find(p => p.id === item.product_id);
                if (product) {
                    await supabase
                        .from('products')
                        .update({ stock: product.stock - item.quantity })
                        .eq('id', item.product_id);
                }
            }

            // Reset form
            setIsCreatingSale(false);
            setSelectedCustomer('');
            setSaleItems([]);
            setNewSaleNotes('');
            fetchData();

            alert('¡Venta registrada exitosamente!');
        } catch (error) {
            console.error('Error creating sale:', error);
            alert('Error al registrar la venta');
        } finally {
            setLoading(false);
        }
    };

    const updateSaleStatus = async (id: string, status: 'completed' | 'cancelled') => {
        try {
            setUpdatingId(id);
            const { error } = await supabase
                .from('sales')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Error al actualizar estado');
        } finally {
            setUpdatingId(null);
        }
    };

    const recordPayment = async (id: string) => {
        try {
            setUpdatingId(id);
            const { error } = await supabase
                .from('sales')
                .update({ payment_status: 'paid' })
                .eq('id', id);

            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Error al registrar pago');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase tracking-tight">Gestión de Ventas</h1>
                <button
                    onClick={() => setIsCreatingSale(true)}
                    className="bg-primary text-background-dark font-black px-6 py-3 rounded-xl hover:bg-white transition-all shadow-lg shadow-primary/20"
                >
                    + Nueva Venta
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-surface-dark rounded-2xl border border-surface-border">
                    <p className="text-[10px] uppercase font-black text-white/40 mb-2 tracking-widest">Ventas Hoy</p>
                    <p className="text-3xl font-black text-primary">${todaySales.toFixed(2)}</p>
                </div>
                <div className="p-6 bg-surface-dark rounded-2xl border border-surface-border">
                    <p className="text-[10px] uppercase font-black text-white/40 mb-2 tracking-widest">Ingresos Totales</p>
                    <p className="text-3xl font-black text-white">${totalSales.toFixed(2)}</p>
                </div>
                <div className="p-6 bg-surface-dark rounded-2xl border border-surface-border">
                    <p className="text-[10px] uppercase font-black text-white/40 mb-2 tracking-widest">Órdenes Totales</p>
                    <p className="text-3xl font-black text-white">{salesCount}</p>
                </div>
            </div>

            {/* New Sale Form */}
            {isCreatingSale && (
                <div className="mb-8 p-8 bg-surface-dark rounded-2xl border border-primary/20 animate-fade-in">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">add_shopping_cart</span>
                        Registrar Nueva Venta
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-primary uppercase ml-1">Cliente</label>
                            <select
                                className="w-full bg-background-dark border border-surface-border p-4 rounded-xl text-white appearance-none"
                                value={selectedCustomer}
                                onChange={e => setSelectedCustomer(e.target.value)}
                            >
                                <option value="">Seleccionar cliente...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.full_name} - {c.email}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-primary uppercase ml-1">Agregar Producto</label>
                            <div className="flex gap-2">
                                <select
                                    className="flex-1 bg-background-dark border border-surface-border p-4 rounded-xl text-white appearance-none"
                                    value={currentItem.product_id}
                                    onChange={e => setCurrentItem({ ...currentItem, product_id: e.target.value })}
                                >
                                    <option value="">Seleccionar producto...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} - ${p.price} (Stock: {p.stock})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-24 bg-background-dark border border-surface-border p-4 rounded-xl text-white text-center"
                                    placeholder="Cant."
                                    value={currentItem.quantity}
                                    onChange={e => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                                />
                                <button
                                    onClick={addItemToSale}
                                    className="bg-primary/10 text-primary font-black px-6 rounded-xl hover:bg-primary hover:text-background-dark transition-all"
                                >
                                    Añadir
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notes Field */}
                    <div className="mb-8">
                        <label className="text-[10px] font-black text-primary uppercase ml-1">Notas del Pedido / Mesa / Referencia</label>
                        <textarea
                            className="w-full bg-background-dark border border-surface-border p-4 rounded-xl text-white mt-2 focus:border-primary outline-none transition-all"
                            rows={2}
                            placeholder="Ej: Mesa VIP 2, Sin hielo, Cliente regular..."
                            value={newSaleNotes}
                            onChange={e => setNewSaleNotes(e.target.value)}
                        />
                    </div>

                    {/* Items List */}
                    {saleItems.length > 0 && (
                        <div className="mb-8 overflow-hidden rounded-xl border border-white/5">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                                    <tr>
                                        <th className="p-4">Producto</th>
                                        <th className="p-4 text-center">Cant.</th>
                                        <th className="p-4 text-right">Unitario</th>
                                        <th className="p-4 text-right">Subtotal</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {saleItems.map((item, index) => {
                                        const product = products.find(p => p.id === item.product_id);
                                        return (
                                            <tr key={index} className="bg-white/2 hover:bg-white/5">
                                                <td className="p-4 font-bold text-sm">{product?.name}</td>
                                                <td className="p-4 text-center font-mono">{item.quantity}</td>
                                                <td className="p-4 text-right font-mono">${item.unit_price.toFixed(2)}</td>
                                                <td className="p-4 text-right font-mono text-primary font-bold">
                                                    ${(item.quantity * item.unit_price).toFixed(2)}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => removeItem(index)} className="text-white/20 hover:text-red-500 transition-colors">
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-white/5">
                                    <tr>
                                        <td colSpan={3} className="p-6 text-right font-black uppercase tracking-widest text-white/40 text-xs">Total de la Venta</td>
                                        <td className="p-6 text-right text-2xl font-black text-primary">${calculateTotal().toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={handleCreateSale}
                            disabled={loading}
                            className="bg-primary text-background-dark font-black px-10 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                        >
                            {loading ? 'Procesando...' : 'Confirmar y Guardar'}
                        </button>
                        <button
                            onClick={() => {
                                setIsCreatingSale(false);
                                setSaleItems([]);
                                setSelectedCustomer('');
                            }}
                            className="text-white/40 font-black uppercase text-xs tracking-widest px-6"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Sales History & Control Center */}
            <div className="bg-surface-dark rounded-2xl border border-surface-border overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-black uppercase tracking-tight">Control Operativo de Pedidos</h2>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-white/40 uppercase ml-1">Estado Pedido</span>
                            <select
                                className="bg-background-dark border border-surface-border px-3 py-2 rounded-lg text-xs font-bold text-white outline-none"
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Todos los Estados</option>
                                <option value="pending">Pendientes</option>
                                <option value="completed">Completados</option>
                                <option value="cancelled">Cancelados</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-white/40 uppercase ml-1">Estado Pago</span>
                            <select
                                className="bg-background-dark border border-surface-border px-3 py-2 rounded-lg text-xs font-bold text-white outline-none"
                                value={filterPayment}
                                onChange={e => setFilterPayment(e.target.value)}
                            >
                                <option value="all">Todos los Pagos</option>
                                <option value="unpaid">Impagos</option>
                                <option value="paid">Pagados</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white/40 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="p-4">Fecha / ID</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Estado Pedido</th>
                                <th className="p-4">Estado Pago</th>
                                <th className="p-4 text-right">Total</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && !sales.length ? (
                                <tr><td colSpan={6} className="p-12 text-center text-white/20 animate-pulse font-bold">Sincronizando con base de datos...</td></tr>
                            ) : sales.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-white/20 italic">No se encontraron registros con estos filtros</td></tr>
                            ) : (
                                sales.map(sale => (
                                    <tr key={sale.id} className="hover:bg-white/2 transition-colors">
                                        <td className="p-4">
                                            <p className="font-mono text-[10px] text-white/40 mb-1">{sale.id.slice(0, 8)}</p>
                                            <p className="font-bold text-xs text-white">
                                                {new Date(sale.sale_date).toLocaleDateString('es-ES', {
                                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-sm">{sale.customers?.full_name || 'Cliente Dakity'}</p>
                                            {sale.notes && (
                                                <p className="text-[10px] text-white/40 italic mt-0.5 line-clamp-1" title={sale.notes}>
                                                    "{sale.notes}"
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${sale.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                sale.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                    'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                }`}>
                                                {sale.status === 'completed' ? 'Entregado' :
                                                    sale.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${sale.payment_status === 'paid' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                                                }`}>
                                                {sale.payment_status === 'paid' ? 'Pagado' : 'Por Cobrar'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-mono text-primary font-bold">
                                            ${Number(sale.total_amount).toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                {sale.payment_status === 'unpaid' && sale.status !== 'cancelled' && (
                                                    <button
                                                        disabled={!!updatingId}
                                                        onClick={() => recordPayment(sale.id)}
                                                        className="text-[9px] font-black uppercase bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                                                        title="Registrar Pago"
                                                    >
                                                        $ Pago
                                                    </button>
                                                )}
                                                {sale.status === 'pending' && (
                                                    <button
                                                        disabled={!!updatingId}
                                                        onClick={() => updateSaleStatus(sale.id, 'completed')}
                                                        className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                                                        title="Completar Pedido"
                                                    >
                                                        Listo
                                                    </button>
                                                )}
                                                {sale.status === 'pending' && (
                                                    <button
                                                        disabled={!!updatingId}
                                                        onClick={() => updateSaleStatus(sale.id, 'cancelled')}
                                                        className="text-[9px] font-black uppercase hover:bg-red-500/20 hover:text-red-400 p-1.5 rounded-lg transition-all"
                                                        title="Cancelar"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">cancel</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesView;

