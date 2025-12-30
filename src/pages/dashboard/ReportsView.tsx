import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ReportData {
    salesByPeriod: {
        daily: number;
        weekly: number;
        monthly: number;
        yearly: number;
    };
    topProducts: Array<{
        name: string;
        category: string;
        totalSold: number;
        revenue: number;
    }>;
    inventoryValue: number;
    lowStockCount: number;
    topCustomers: Array<{
        name: string;
        totalSpent: number;
        purchaseCount: number;
    }>;
}

const ReportsView: React.FC = () => {
    const [reportData, setReportData] = useState<ReportData>({
        salesByPeriod: { daily: 0, weekly: 0, monthly: 0, yearly: 0 },
        topProducts: [],
        inventoryValue: 0,
        lowStockCount: 0,
        topCustomers: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);

            // Fetch sales
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select('*, customers(full_name)');

            if (salesError) {
                console.error('Error fetching sales:', salesError);
            }

            // Fetch products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*');

            if (productsError) {
                console.error('Error fetching products:', productsError);
            }

            // Fetch sale items for real product statistics
            const { data: saleItemsData, error: saleItemsError } = await supabase
                .from('sale_items')
                .select('*, products(name, category, price)');

            if (saleItemsError) {
                console.error('Error fetching sale items:', saleItemsError);
            }

            // Calculate periods
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();

            const daily = salesData?.filter(s => s.sale_date?.startsWith(today))
                .reduce((sum, s) => sum + Number(s.total_amount || 0), 0) || 0;

            const weekly = salesData?.filter(s => s.sale_date >= weekAgo)
                .reduce((sum, s) => sum + Number(s.total_amount || 0), 0) || 0;

            const monthly = salesData?.filter(s => s.sale_date >= monthAgo)
                .reduce((sum, s) => sum + Number(s.total_amount || 0), 0) || 0;

            const yearly = salesData?.filter(s => s.sale_date >= yearAgo)
                .reduce((sum, s) => sum + Number(s.total_amount || 0), 0) || 0;

            // Calculate inventory value
            const inventoryValue = productsData?.reduce((sum, p) => sum + (p.price * p.stock), 0) || 0;
            const lowStockCount = productsData?.filter(p => p.stock < 10).length || 0;

            // Calculate top products from real sale_items data
            const productSales = new Map<string, { name: string; category: string; totalSold: number; revenue: number }>();

            saleItemsData?.forEach(item => {
                const productId = item.product_id;
                const productName = item.products?.name || 'Producto desconocido';
                const productCategory = item.products?.category || 'General';
                const quantity = item.quantity || 0;
                const revenue = (item.unit_price || 0) * quantity;

                const current = productSales.get(productId) || {
                    name: productName,
                    category: productCategory,
                    totalSold: 0,
                    revenue: 0
                };

                current.totalSold += quantity;
                current.revenue += revenue;
                productSales.set(productId, current);
            });

            const topProducts = Array.from(productSales.values())
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            // If no sale items, show top 5 products by price as fallback
            const fallbackTopProducts = topProducts.length === 0 && productsData
                ? productsData
                    .sort((a, b) => b.price - a.price)
                    .slice(0, 5)
                    .map(p => ({
                        name: p.name,
                        category: p.category || 'General',
                        totalSold: 0,
                        revenue: 0
                    }))
                : [];

            // Top customers
            const customerSales = new Map<string, { name: string; total: number; count: number }>();
            salesData?.forEach(sale => {
                const customerId = sale.customer_id;
                const customerName = sale.customers?.full_name || 'Cliente desconocido';
                const current = customerSales.get(customerId) || { name: customerName, total: 0, count: 0 };
                current.total += Number(sale.total_amount || 0);
                current.count += 1;
                customerSales.set(customerId, current);
            });

            const topCustomers = Array.from(customerSales.values())
                .sort((a, b) => b.total - a.total)
                .slice(0, 5)
                .map(c => ({
                    name: c.name,
                    totalSpent: c.total,
                    purchaseCount: c.count
                }));

            setReportData({
                salesByPeriod: { daily, weekly, monthly, yearly },
                topProducts: topProducts.length > 0 ? topProducts : fallbackTopProducts,
                inventoryValue,
                lowStockCount,
                topCustomers
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="size-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/60 font-bold">Generando reportes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">Reportes y Analíticas</h1>
                <p className="text-white/60">Análisis detallado del rendimiento de tu negocio</p>
            </div>

            {/* Period Selector */}
            <div className="flex gap-4">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(period => (
                    <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${selectedPeriod === period
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                    >
                        {period === 'daily' && 'Hoy'}
                        {period === 'weekly' && 'Semana'}
                        {period === 'monthly' && 'Mes'}
                        {period === 'yearly' && 'Año'}
                    </button>
                ))}
            </div>

            {/* Sales Report */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30 p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="size-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <span className="material-symbols-outlined text-white text-2xl fill-1">analytics</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">Reporte de Ventas</h2>
                        <p className="text-white/60">Período seleccionado: {
                            selectedPeriod === 'daily' ? 'Hoy' :
                                selectedPeriod === 'weekly' ? 'Última semana' :
                                    selectedPeriod === 'monthly' ? 'Último mes' : 'Último año'
                        }</p>
                    </div>
                </div>
                <div className="text-5xl font-black text-white mb-2">
                    ${reportData.salesByPeriod[selectedPeriod].toFixed(2)}
                </div>
                <p className="text-purple-400 font-bold">Total de ventas en el período</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-slate-800/50 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-transparent">
                        <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-400">emoji_events</span>
                            Top 5 Productos
                        </h2>
                    </div>
                    <div className="p-6">
                        {reportData.topProducts.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined text-white/20 text-5xl mb-3">inventory_2</span>
                                <p className="text-white/40 font-bold">No hay datos de ventas de productos</p>
                                <p className="text-white/20 text-sm mt-1">Registra ventas para ver estadísticas</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reportData.topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                                        <div className="size-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center font-black text-white">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white">{product.name}</p>
                                            <p className="text-xs text-white/40">{product.category} • {product.totalSold} vendidos</p>
                                        </div>
                                        <p className="text-lg font-black text-amber-400">${product.revenue.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-slate-800/50 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-transparent">
                        <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-400">person_celebrate</span>
                            Top 5 Clientes
                        </h2>
                    </div>
                    <div className="p-6">
                        {reportData.topCustomers.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined text-white/20 text-5xl mb-3">group</span>
                                <p className="text-white/40 font-bold">No hay datos de clientes</p>
                                <p className="text-white/20 text-sm mt-1">Registra ventas para ver estadísticas de clientes</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reportData.topCustomers.map((customer, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                                        <div className="size-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center font-black text-white">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white">{customer.name}</p>
                                            <p className="text-xs text-white/40">{customer.purchaseCount} compras</p>
                                        </div>
                                        <p className="text-lg font-black text-green-400">${customer.totalSpent.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Inventory Report */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/30">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <span className="material-symbols-outlined text-white fill-1">inventory</span>
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-white/60 tracking-wider">Valor del Inventario</p>
                            <p className="text-3xl font-black text-white">${reportData.inventoryValue.toFixed(2)}</p>
                        </div>
                    </div>
                    <p className="text-blue-400 text-sm">Total del valor de productos en stock</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/30">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                            <span className="material-symbols-outlined text-white fill-1">warning</span>
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-white/60 tracking-wider">Stock Bajo</p>
                            <p className="text-3xl font-black text-white">{reportData.lowStockCount}</p>
                        </div>
                    </div>
                    <p className="text-red-400 text-sm">Productos con menos de 10 unidades</p>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
