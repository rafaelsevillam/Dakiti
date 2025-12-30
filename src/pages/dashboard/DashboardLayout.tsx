import React, { useState } from 'react';
import { Route, Routes, Link, useLocation } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import InventoryView from './InventoryView';
import SalesView from './SalesView';
import CustomersView from './CustomersView';
import ReportsView from './ReportsView';
import UsersManagementView from './UsersManagementView';
import CategoriesView from './CategoriesView';
import ExperiencesView from './ExperiencesView';
import SiteSettingsView from './SiteSettingsView';
import HubManagementView from './HubManagementView';
import PagesManagementView from './PagesManagementView';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout: React.FC = () => {
    const location = useLocation();
    const { signOut, role } = useAuth();

    const allNavItems = [
        { name: 'Dashboard', path: '/dashboard', icon: 'dashboard', roles: ['admin', 'seller'] },
        { name: 'Inventario', path: '/dashboard/inventory', icon: 'inventory_2', roles: ['admin'] },
        { name: 'Ventas', path: '/dashboard/sales', icon: 'monitoring', roles: ['admin', 'seller'] },
        { name: 'Clientes', path: '/dashboard/customers', icon: 'group', roles: ['admin', 'seller'] },
        { name: 'Reportes', path: '/dashboard/reports', icon: 'analytics', roles: ['admin'] },
        { name: 'Experiencias', path: '/dashboard/experiences', icon: 'skateboarding', roles: ['admin'] },
        { name: 'Categorías', path: '/dashboard/categories', icon: 'category', roles: ['admin'] },
        { name: 'VIP Hub', path: '/dashboard/hub', icon: 'hub', roles: ['admin'] },
        { name: 'Páginas', path: '/dashboard/pages', icon: 'description', roles: ['admin'] },
        { name: 'Sitio Web', path: '/dashboard/cms', icon: 'web', roles: ['admin'] },
        { name: 'Usuarios', path: '/dashboard/users', icon: 'manage_accounts', roles: ['admin'] },
    ];

    const navItems = allNavItems.filter(item => role && item.roles.includes(role));

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white font-display">
            {/* Sidebar */}
            <aside className="w-64 border-r border-amber-500/20 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col shadow-2xl shadow-amber-500/10">
                <div className="h-20 flex items-center justify-between px-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-purple-500/10">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <span className="material-symbols-outlined text-white font-bold">shield</span>
                        </div>
                        <div>
                            <span className="text-xl font-black uppercase italic tracking-tighter text-white block">Dakity</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Admin Panel</span>
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl border border-amber-500/20">
                        <div className="size-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-lg">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">Administrador</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">Rol: {role}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${location.pathname.startsWith(item.path)
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${location.pathname.startsWith(item.path) ? 'fill-1' : ''}`}>{item.icon}</span>
                            <span className="font-bold text-sm uppercase tracking-wide">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-amber-500/20 bg-gradient-to-t from-slate-950/50 to-transparent">
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                    >
                        <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">logout</span>
                        <span className="font-bold text-sm uppercase tracking-wide">Salir</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800">
                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="inventory" element={<InventoryView />} />
                    <Route path="sales" element={<SalesView />} />
                    <Route path="customers" element={<CustomersView />} />
                    <Route path="reports" element={<ReportsView />} />
                    <Route path="experiences" element={<ExperiencesView />} />
                    <Route path="users" element={<UsersManagementView />} />
                    <Route path="categories" element={<CategoriesView />} />
                    <Route path="cms" element={<SiteSettingsView />} />
                    <Route path="hub" element={<HubManagementView />} />
                    <Route path="pages" element={<PagesManagementView />} />
                    <Route path="*" element={<DashboardHome />} />
                </Routes>
            </main>
        </div>
    );
};

export default DashboardLayout;
