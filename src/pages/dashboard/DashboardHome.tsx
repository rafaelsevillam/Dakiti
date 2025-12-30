import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import KPICard from '../../components/KPICard';

interface DashboardStats {
    todaySales: number;
    monthSales: number;
    totalProducts: number;
    lowStockProducts: number;
    totalCustomers: number;
    recentSales: Array<{
        id: string;
        sale_date: string;
        total_amount: number;
        customer_name: string;
    }>;
    topProducts: Array<{
        name: string;
        total_sold: number;
        revenue: number;
    }>;
}

const DashboardHome: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        todaySales: 0,
        monthSales: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        totalCustomers: 0,
        recentSales: [],
        topProducts: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch sales data
            const { data: salesData } = await supabase
                .from('sales')
                .select('*, customers(full_name)')
                .order('sale_date', { ascending: false });

            // Fetch products
            const { data: productsData } = await supabase
                .from('products')
                .select('*');

            // Fetch customers
            const { data: customersData } = await supabase
                .from('customers')
                .select('id');

            // Fetch sale items for real product statistics
            const { data: saleItemsData } = await supabase
                .from('sale_items')
                .select('*, products(name, price)');

            // Calculate metrics
            const today = new Date().toISOString().split('T')[0];
            const currentMonth = new Date().toISOString().substring(0, 7);

            const todaySales = salesData
                ?.filter(s => s.sale_date?.startsWith(today))
                .reduce((sum, s) => sum + Number(s.total_amount || 0), 0) || 0;

            const monthSales = salesData
                ?.filter(s => s.sale_date?.startsWith(currentMonth))
                .reduce((sum, s) => sum + Number(s.total_amount || 0), 0) || 0;

            const lowStockProducts = productsData?.filter(p => p.stock < 10).length || 0;

            // Recent sales
            const recentSales = salesData?.slice(0, 5).map(s => ({
                id: s.id,
                sale_date: s.sale_date,
                total_amount: s.total_amount,
                customer_name: s.customers?.full_name || 'Cliente desconocido'
            })) || [];

            // Calculate top products from real sale_items data
            const productSales = new Map<string, { name: string; totalSold: number; revenue: number }>();

            saleItemsData?.forEach(item => {
                const productId = item.product_id;
                const productName = item.products?.name || 'Producto desconocido';
                const quantity = item.quantity || 0;
                const revenue = (item.unit_price || 0) * quantity;

                const current = productSales.get(productId) || {
                    name: productName,
                    totalSold: 0,
                    revenue: 0
                };

                current.totalSold += quantity;
                current.revenue += revenue;
                productSales.set(productId, current);
            });

            const topProducts = Array.from(productSales.values())
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5)
                .map(p => ({
                    name: p.name,
                    total_sold: p.totalSold,
                    revenue: p.revenue
                }));

            setStats({
                todaySales,
                monthSales,
                totalProducts: productsData?.length || 0,
                lowStockProducts,
                totalCustomers: customersData?.length || 0,
                recentSales,
                topProducts
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="size-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/60 font-bold">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">Dashboard</h1>
                <p className="text-white/60">Resumen de tu negocio en tiempo real</p>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Ventas Hoy"
                    value={`$${stats.todaySales.toFixed(2)}`}
                    icon="payments"
                    color="amber"
                    trend={{ value: '+12%', isPositive: true }}
                />
                <KPICard
                    title="Ventas del Mes"
                    value={`$${stats.monthSales.toFixed(2)}`}
                    icon="trending_up"
                    color="green"
                    trend={{ value: '+8%', isPositive: true }}
                />
                <KPICard
                    title="Productos en Stock"
                    value={stats.totalProducts}
                    icon="inventory_2"
                    color="blue"
                />
                <KPICard
                    title="Clientes Activos"
                    value={stats.totalCustomers}
                    icon="group"
                    color="purple"
                />
            </div>

            {/* Alerts */}
            {stats.lowStockProducts > 0 && (
                <div className="p-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                            <span className="material-symbols-outlined text-white fill-1">warning</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Alerta de Stock Bajo</h3>
                            <p className="text-white/60 text-sm">
                                {stats.lowStockProducts} producto{stats.lowStockProducts > 1 ? 's' : ''} con menos de 10 unidades en stock
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Sales */}
                <div className="bg-slate-800/50 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-transparent">
                        <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-400">receipt_long</span>
                            Ventas Recientes
                        </h2>
                    </div>
                    <div className="p-6">
                        {stats.recentSales.length === 0 ? (
                            <p className="text-white/40 text-center py-8">No hay ventas registradas</p>
                        ) : (
                            <div className="space-y-4">
                                {stats.recentSales.map(sale => (
                                    <div key={sale.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        <div>
                                            <p className="font-bold text-white">{sale.customer_name}</p>
                                            <p className="text-xs text-white/40">
                                                {new Date(sale.sale_date).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <p className="text-lg font-black text-amber-400">${sale.total_amount.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-slate-800/50 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-transparent">
                        <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-purple-400">star</span>
                            Productos Destacados
                        </h2>
                    </div>
                    <div className="p-6">
                        {stats.topProducts.length === 0 ? (
                            <p className="text-white/40 text-center py-8">No hay datos disponibles</p>
                        ) : (
                            <div className="space-y-4">
                                {stats.topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className="size-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-black text-white">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white">{product.name}</p>
                                            <p className="text-xs text-white/40">{product.total_sold} unidades vendidas</p>
                                        </div>
                                        <p className="text-sm font-bold text-purple-400">${product.revenue.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
