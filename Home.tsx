import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from './src/lib/supabaseClient';
import { Product, CartItem } from './types';
import AIChatbot from './components/AIChatbot';
import AIVoiceAssistant from './components/AIVoiceAssistant';
import ShareModal from './components/ShareModal';
import NightlifeHub from './components/NightlifeHub';
import ProductDetailModal from './src/components/ProductDetailModal';
import ExperienceDetailModal from './src/components/ExperienceDetailModal';
import { useAuth } from './src/context/AuthContext';
import { useCart } from './src/context/CartContext';

const Home: React.FC = () => {
    const [currentTab, setCurrentTab] = useState<'discover' | 'hub'>('discover');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { cart, setCart, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart } = useCart() as any; // Cast for compatibility with existing logic
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // DB Data States
    const [dbProducts, setDbProducts] = useState<Product[]>([]);
    const [dbCategories, setDbCategories] = useState<{ id: string, name: string, icon: string }[]>([]);
    const [navLinks, setNavLinks] = useState<{ name: string, path: string }[]>([]);
    const [experiences, setExperiences] = useState<any[]>([]);
    const [siteConfig, setSiteConfig] = useState<any>({});
    const [customers, setCustomers] = useState<{ id: string, full_name: string, email: string }[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [orderNotes, setOrderNotes] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Detail States
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedExperience, setSelectedExperience] = useState<any | null>(null);

    const { signOut, user, role } = useAuth();

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);

                // Fetch Categories
                const { data: catData } = await supabase
                    .from('categories')
                    .select('slug, name, icon')
                    .order('order', { ascending: true });

                const formattedCats = [
                    { id: 'all', name: 'Todos', icon: 'local_fire_department' },
                    ...(catData || []).map(c => ({ id: c.slug, name: c.name, icon: c.icon }))
                ];
                setDbCategories(formattedCats);

                // Fetch Products
                const { data: prodData } = await supabase
                    .from('products')
                    .select('*')
                    .order('name');
                setDbProducts(prodData || []);

                // Fetch Navigation
                const { data: navData } = await supabase
                    .from('navigation_links')
                    .select('name, path')
                    .eq('is_active', true)
                    .order('order', { ascending: true });
                setNavLinks(navData || []);

                // Fetch Experiences
                const { data: expData } = await supabase
                    .from('experiences')
                    .select('*')
                    .eq('is_active', true)
                    .order('order', { ascending: true });
                setExperiences(expData || []);

                // Fetch Site Config
                const { data: configData } = await supabase
                    .from('site_config')
                    .select('*');

                const configMap = (configData || []).reduce((acc: any, item: any) => {
                    acc[item.key] = item.value;
                    return acc;
                }, {});
                setSiteConfig(configMap);

            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    // Fetch customers if employee
    useEffect(() => {
        if (user && (role === 'admin' || role === 'seller')) {
            const fetchCustomers = async () => {
                const { data } = await supabase
                    .from('customers')
                    .select('id, full_name, email')
                    .order('full_name');
                setCustomers(data || []);
            };
            fetchCustomers();
        }
    }, [user, role]);

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'all') return dbProducts;
        return dbProducts.filter(p => p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory === 'all');
    }, [selectedCategory, dbProducts]);

    return (
        <div className="min-h-screen bg-background-dark text-white font-display selection:bg-primary/30">
            {/* Navegación */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-surface-border">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className="size-10 rounded-xl flex items-center justify-center shadow-lg transition-colors"
                            style={{
                                backgroundColor: siteConfig.branding?.primary_color || '#FFD700',
                                boxShadow: `0 10px 15px -3px ${siteConfig.branding?.primary_color}33`
                            }}
                        >
                            <span className="material-symbols-outlined text-white font-bold">
                                {siteConfig.branding?.logo_icon || 'local_bar'}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
                            {siteConfig.branding?.business_name || 'Dakity'}
                        </h1>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {loading ? (
                            <div className="h-4 w-40 bg-white/5 animate-pulse rounded"></div>
                        ) : (
                            navLinks.map((link, idx) => (
                                <a
                                    key={idx}
                                    href={link.path}
                                    className="text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="text-xs text-white/60 mr-2 hidden md:block">
                                Hola, {user?.email}
                            </div>
                        )}
                        {!user ? (
                            <a
                                href="/login"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
                                title="Acceso Administrativo"
                            >
                                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                                <span className="hidden md:inline">Admin Login</span>
                            </a>
                        ) : (
                            <>
                                {role === 'admin' && (
                                    <a
                                        href="/dashboard/inventory"
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shadow-purple-500/20"
                                        title="Panel Administrativo"
                                    >
                                        <span className="material-symbols-outlined text-sm">dashboard</span>
                                        <span className="hidden md:inline">Dashboard</span>
                                    </a>
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className="size-10 rounded-full border border-surface-border flex items-center justify-center hover:bg-white/5 transition-all"
                                    title="Cerrar Sesión"
                                >
                                    <span className="material-symbols-outlined text-white/80">logout</span>
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="size-10 rounded-full border border-surface-border flex items-center justify-center hover:bg-white/5 transition-all"
                            title="Compartir la vibra"
                        >
                            <span className="material-symbols-outlined text-white/80">ios_share</span>
                        </button>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative size-12 bg-surface-dark border border-surface-border rounded-full flex items-center justify-center hover:bg-surface-border transition-all"
                        >
                            <span className="material-symbols-outlined text-white">shopping_bag</span>
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 size-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-background-dark">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Contenido Principal */}
            <main className="pt-28 pb-20 px-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-8 mb-8 border-b border-surface-border">
                    <button
                        onClick={() => setCurrentTab('discover')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${currentTab === 'discover' ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                    >
                        Catálogo
                        {currentTab === 'discover' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_10px_#FFD700]"></div>}
                    </button>
                    <button
                        onClick={() => setCurrentTab('hub')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${currentTab === 'hub' ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                    >
                        VIP Hub
                        {currentTab === 'hub' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_10px_#FFD700]"></div>}
                    </button>
                </div>

                {currentTab === 'discover' ? (
                    <>
                        {/* Sección Hero */}
                        <section className="mb-12 relative rounded-[2.5rem] overflow-hidden aspect-[21/9] flex items-center px-12">
                            <img
                                src={siteConfig.hero?.image_url || "https://images.unsplash.com/photo-1514525253361-b83f859b73c0?auto=format&fit=crop&q=80&w=2000"}
                                className="absolute inset-0 w-full h-full object-cover opacity-60"
                                alt="Vida Nocturna Hero"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/40 to-transparent"></div>
                            <div className="relative z-10 max-w-lg">
                                <span
                                    className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4 border"
                                    style={{
                                        backgroundColor: `${siteConfig.branding?.primary_color}22`,
                                        color: siteConfig.branding?.primary_color || '#FFD700',
                                        borderColor: `${siteConfig.branding?.primary_color}44`
                                    }}
                                >
                                    {siteConfig.hero?.badge || 'Servicio Élite • 24/7'}
                                </span>
                                <h2 className="text-5xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight text-white drop-shadow-2xl">
                                    {siteConfig.hero?.title?.split('.').map((part: string, i: number) => (
                                        <span key={i}>
                                            {part}{i === 0 && siteConfig.hero?.title.includes('.') && <span style={{ color: siteConfig.branding?.primary_color || '#FFD700' }} className="italic">.</span>}
                                        </span>
                                    ))}
                                    {!siteConfig.hero?.title && <>La Noche es <span className="text-primary italic">Tuya.</span></>}
                                </h2>
                                <p className="text-white/70 text-lg mb-8 leading-relaxed font-medium">
                                    {siteConfig.hero?.subtitle || 'Servicio de botellas premium, maridajes gourmet y experiencias VIP entregadas en tu puerta en 20 minutos.'}
                                </p>
                                <button
                                    onClick={() => {
                                        const el = document.getElementById('catalog-start');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-8 py-4 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                                    style={{
                                        backgroundColor: siteConfig.branding?.primary_color || '#FFD700',
                                        boxShadow: `0 20px 25px -5px ${siteConfig.branding?.primary_color}33`,
                                        color: '#000'
                                    }}
                                >
                                    Pedir Ahora
                                </button>
                            </div>
                        </section>

                        {/* Sección de Experiencias */}
                        {experiences.length > 0 && (
                            <div className="mb-20">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tight">Experiencias VIP</h2>
                                        <p className="text-white/40 text-sm">Momentos diseñados para elevar tu nivel de fiesta.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const el = document.getElementById('catalog-start');
                                            el?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                                    >
                                        Ver Todas <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {experiences.map(exp => (
                                        <div key={exp.id} onClick={() => setSelectedExperience(exp)} className="group relative h-80 rounded-[2rem] overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 cursor-pointer">
                                            <img src={exp.image_url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={exp.title} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <h3 className="text-2xl font-black mb-2">{exp.title}</h3>
                                                        <p className="text-white/60 text-sm line-clamp-1 group-hover:line-clamp-none transition-all duration-500">{exp.description}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-white/40 uppercase font-bold mb-1">Desde</p>
                                                        <p className="text-2xl font-black text-primary">${exp.price.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Categorías */}
                        <div id="catalog-start" className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
                            {loading && dbCategories.length === 0 ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-12 w-32 bg-white/5 animate-pulse rounded-full"></div>
                                ))
                            ) : (
                                dbCategories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all whitespace-nowrap ${selectedCategory === cat.id
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                            : 'bg-surface-dark border-surface-border text-white/60 hover:border-white/20'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                                        <span className="font-bold text-sm uppercase tracking-wider">{cat.name}</span>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredProducts.map(product => (
                                <div key={product.id} onClick={() => setSelectedProduct(product)} className="group bg-surface-dark/50 border border-surface-border rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                                    <div className="relative aspect-square overflow-hidden bg-black/20">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(product);
                                            }}
                                            className="absolute bottom-4 right-4 size-12 bg-white text-background-dark rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 shadow-xl"
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{product.name}</h3>
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <span className="material-symbols-outlined text-sm fill-1">star</span>
                                                <span className="text-xs font-bold">{product.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-white/40 text-xs mb-4">{product.volume} • {product.origin}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-black text-white">${product.price.toFixed(2)}</span>
                                            {product.old_price && (
                                                <span className="text-white/20 line-through text-sm">${product.old_price.toFixed(2)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <NightlifeHub />
                )}
            </main>

            {/* Sidebar del Carrito */}
            {
                isCartOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                        <div className="relative w-full max-w-md bg-surface-dark border-l border-surface-border h-full flex flex-col animate-slide-left shadow-2xl">
                            <div className="p-8 border-b border-surface-border flex items-center justify-between">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Tu Pedido</h2>
                                <button onClick={() => setIsCartOpen(false)} className="text-white/40 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <span className="material-symbols-outlined text-6xl mb-4">shopping_basket</span>
                                        <p className="text-lg font-bold">Tu carrito está vacío</p>
                                        <p className="text-sm">Empieza a añadir artículos para la fiesta</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <div className="size-16 bg-white/10 rounded-xl overflow-hidden shrink-0">
                                                    <img src={item.image} className="w-full h-full object-contain p-2" alt={item.name} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm">{item.name}</h4>
                                                    <p className="text-white/40 text-xs">{item.volume} • Cant: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">Eliminar</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && user && (role === 'admin' || role === 'seller') && (
                                <div className="px-8 py-4 bg-white/5 border-t border-white/5 space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-primary uppercase ml-1">Cliente del Pedido</label>
                                        <select
                                            className="w-full bg-background-dark border border-surface-border p-3 rounded-xl text-white text-sm appearance-none focus:border-primary outline-none"
                                            value={selectedCustomerId}
                                            onChange={e => setSelectedCustomerId(e.target.value)}
                                        >
                                            <option value="">-- Seleccionar Cliente --</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-primary uppercase ml-1">Notas / Mesa / Referencia</label>
                                        <textarea
                                            className="w-full bg-background-dark border border-surface-border p-3 rounded-xl text-white text-sm focus:border-primary outline-none resize-none"
                                            rows={2}
                                            placeholder="Ej: Mesa 4, VIP, Sin hielo..."
                                            value={orderNotes}
                                            onChange={e => setOrderNotes(e.target.value)}
                                        />
                                    </div>
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                        <p className="text-[10px] text-blue-400 font-bold leading-tight">
                                            <span className="material-symbols-outlined text-[12px] align-middle mr-1">info</span>
                                            MODO EMPLEADO: Este pedido se generará como una cuenta por cobrar (Pendiente de pago).
                                        </p>
                                    </div>
                                </div>
                            )}

                            {cart.length > 0 && (
                                <div className="p-8 bg-background-dark/50 border-t border-surface-border space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/60 font-bold uppercase text-sm tracking-widest">Monto Total</span>
                                        <span className="text-3xl font-black text-primary">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!user) {
                                                window.location.href = '/login';
                                                return;
                                            }

                                            const isEmployee = role === 'admin' || role === 'seller';
                                            if (isEmployee && !selectedCustomerId) {
                                                alert('Por favor selecciona un cliente para este pedido.');
                                                return;
                                            }

                                            try {
                                                setLoading(true);

                                                let finalCustomerId = selectedCustomerId;

                                                // If regular client, find/create their customer record
                                                if (!isEmployee) {
                                                    const { data: existingCust } = await supabase
                                                        .from('customers')
                                                        .select('id')
                                                        .eq('email', user.email)
                                                        .single();

                                                    if (existingCust) {
                                                        finalCustomerId = existingCust.id;
                                                    } else {
                                                        // Create a customer record for this auth user
                                                        const { data: newCust, error: custError } = await supabase
                                                            .from('customers')
                                                            .insert([{
                                                                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cliente Web',
                                                                email: user.email,
                                                                phone: user.user_metadata?.phone || ''
                                                            }])
                                                            .select()
                                                            .single();

                                                        if (custError) throw custError;
                                                        finalCustomerId = newCust.id;
                                                    }
                                                }

                                                // 1. Insert Sale header
                                                const { data: saleData, error: saleError } = await supabase
                                                    .from('sales')
                                                    .insert([{
                                                        customer_id: finalCustomerId,
                                                        total_amount: cartTotal,
                                                        status: 'pending',
                                                        payment_status: isEmployee ? 'unpaid' : 'paid',
                                                        created_by: user.id,
                                                        notes: orderNotes
                                                    }])
                                                    .select()
                                                    .single();

                                                if (saleError) throw saleError;

                                                // 2. Insert Sale Items
                                                const saleItems = cart.map(item => ({
                                                    sale_id: saleData.id,
                                                    product_id: item.id,
                                                    quantity: item.quantity,
                                                    unit_price: item.price
                                                }));

                                                const { error: itemsError } = await supabase
                                                    .from('sale_items')
                                                    .insert(saleItems);

                                                if (itemsError) throw itemsError;

                                                // 3. Update Inventory Stock
                                                for (const item of cart) {
                                                    const { data: prod } = await supabase
                                                        .from('products')
                                                        .select('stock')
                                                        .eq('id', item.id)
                                                        .single();

                                                    if (prod && prod.stock !== null) {
                                                        await supabase
                                                            .from('products')
                                                            .update({ stock: Math.max(0, prod.stock - item.quantity) })
                                                            .eq('id', item.id);
                                                    }
                                                }

                                                alert('🚀 ¡Pedido Realizado con Éxito! \nPrepara los vasos, Dakity va en camino.');
                                                setCart([]); // This should probably be clearCart()
                                                setSelectedCustomerId('');
                                                setOrderNotes('');
                                                setIsCartOpen(false);
                                            } catch (err: any) {
                                                console.error(err);
                                                alert('Error al procesar el pedido: ' + (err.message || 'Intenta de nuevo.'));
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="w-full py-5 bg-primary text-white rounded-full font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                                    >
                                        Pago Seguro
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Modal de Compartir */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                cartItems={cart}
            />

            {/* Componentes de IA */}
            <AIChatbot />
            <AIVoiceAssistant />

            {/* Modales de Detalle */}
            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={addToCart}
                />
            )}
            {selectedExperience && (
                <ExperienceDetailModal
                    experience={selectedExperience}
                    isOpen={!!selectedExperience}
                    onClose={() => setSelectedExperience(null)}
                />
            )}
        </div>
    );
};

export default Home;
