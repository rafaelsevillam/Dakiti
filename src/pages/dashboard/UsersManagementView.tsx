import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface UserProfile {
    id: string;
    full_name: string;
    role: 'client' | 'seller' | 'admin';
    created_at: string;
    email?: string;
}

const UsersManagementView: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // Fetch profiles
            const { data: profilesData, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch auth users to get emails
            const usersWithEmails = await Promise.all(
                (profilesData || []).map(async (profile) => {
                    try {
                        const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
                        return {
                            ...profile,
                            email: user?.email || 'No disponible'
                        };
                    } catch {
                        return {
                            ...profile,
                            email: 'No disponible'
                        };
                    }
                })
            );

            setUsers(usersWithEmails);
        } catch (error) {
            console.error('Error loading users:', error);
            // If admin API fails, just show profiles without emails
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            setUsers((profilesData || []).map(p => ({ ...p, email: 'No disponible' })));
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'client' | 'seller' | 'admin') => {
        if (!confirm(`¿Estás seguro de cambiar el rol de este usuario a ${newRole}?`)) return;

        try {
            // Update optimistically in UI
            setUsers(prevUsers =>
                prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u)
            );

            // Use RPC function to update role (bypasses RLS policies)
            const { error } = await supabase.rpc('update_user_role', {
                target_user_id: userId,
                new_role: newRole
            });

            if (error) {
                console.error('Supabase RPC error:', error);
                throw error;
            }

            console.log('Role updated successfully');
            alert('Rol actualizado exitosamente');

            // Refresh to ensure consistency
            await fetchUsers();
        } catch (error: any) {
            console.error('Error updating role:', error);
            alert(`Error al actualizar el rol: ${error.message || 'Error desconocido'}`);
            // Revert optimistic update
            await fetchUsers();
        }
    };

    const handleEdit = (user: UserProfile) => {
        setEditingUser(user);
        setIsEditing(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editingUser.full_name
                })
                .eq('id', editingUser.id);

            if (error) throw error;

            setIsEditing(false);
            setEditingUser(null);
            alert('Usuario actualizado exitosamente');
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error al actualizar usuario');
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'seller':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default:
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Administrador';
            case 'seller':
                return 'Vendedor';
            default:
                return 'Cliente';
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-white/60 mt-1">Administra roles y permisos de usuarios</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-white/40 uppercase tracking-wider">Total Usuarios</p>
                        <p className="text-2xl font-black text-white">{users.length}</p>
                    </div>
                </div>
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

            {/* Info Alert */}
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-400">info</span>
                <div className="flex-1">
                    <p className="text-sm text-white/80">
                        <strong>Roles disponibles:</strong> <span className="text-amber-400">Admin</span> (acceso completo),
                        <span className="text-purple-400"> Vendedor</span> (ventas y clientes),
                        <span className="text-blue-400"> Cliente</span> (solo compras)
                    </p>
                </div>
            </div>

            {/* Edit Form */}
            {isEditing && editingUser && (
                <div className="mb-6 p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/30 animate-fade-in shadow-xl shadow-blue-500/10">
                    <h2 className="text-xl font-bold mb-4 text-blue-400">Editar Usuario</h2>
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            className="bg-slate-800 border border-blue-500/20 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Nombre Completo"
                            value={editingUser.full_name}
                            onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
                            required
                        />
                        <input
                            className="bg-slate-800 border border-blue-500/20 p-3 rounded-lg text-white/40 cursor-not-allowed"
                            placeholder="Email (no editable)"
                            value={editingUser.email}
                            disabled
                        />
                        <div className="md:col-span-2 flex gap-4 mt-4">
                            <button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-6 py-2 rounded-lg hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                                Actualizar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditingUser(null);
                                }}
                                className="bg-transparent text-white/60 font-bold px-6 py-2 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-slate-800/50 rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Usuario</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Rol Actual</th>
                            <th className="p-4">Fecha de Registro</th>
                            <th className="p-4 text-center">Acciones</th>
                            <th className="p-4 text-right">Cambiar Rol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-white/40">Cargando usuarios...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-white/40">No hay usuarios registrados</td></tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white">person</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{user.full_name || 'Sin nombre'}</p>
                                                <p className="text-xs text-white/40">ID: {user.id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-white/80 text-sm">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(user.role)}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-white/60">
                                        {new Date(user.created_at).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-white/40 hover:text-blue-400 transition-colors"
                                            title="Editar Usuario"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleRoleChange(user.id, 'admin')}
                                                    className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-colors"
                                                    title="Hacer Admin"
                                                >
                                                    Admin
                                                </button>
                                            )}
                                            {user.role !== 'seller' && (
                                                <button
                                                    onClick={() => handleRoleChange(user.id, 'seller')}
                                                    className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition-colors"
                                                    title="Hacer Vendedor"
                                                >
                                                    Vendedor
                                                </button>
                                            )}
                                            {user.role !== 'client' && (
                                                <button
                                                    onClick={() => handleRoleChange(user.id, 'client')}
                                                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-colors"
                                                    title="Hacer Cliente"
                                                >
                                                    Cliente
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <span className="material-symbols-outlined text-white fill-1">shield</span>
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-white/60 tracking-wider">Administradores</p>
                            <p className="text-3xl font-black text-white">{users.filter(u => u.role === 'admin').length}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <span className="material-symbols-outlined text-white fill-1">storefront</span>
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-white/60 tracking-wider">Vendedores</p>
                            <p className="text-3xl font-black text-white">{users.filter(u => u.role === 'seller').length}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/30">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <span className="material-symbols-outlined text-white fill-1">group</span>
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-white/60 tracking-wider">Clientes</p>
                            <p className="text-3xl font-black text-white">{users.filter(u => u.role === 'client').length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersManagementView;
