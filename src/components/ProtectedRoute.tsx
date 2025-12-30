import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('client' | 'seller' | 'admin')[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { session, loading, role } = useAuth();

    if (loading) {
        return <div className="text-white text-center p-20">Cargando...</div>;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />; // Redirect to home if unauthorized
    }

    return children;
};
