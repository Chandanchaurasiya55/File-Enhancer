import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/user/login" replace />;
    }

    if (requiredRole) {
        // For admin routes, allow both 'admin' and 'superadmin' roles
        if (requiredRole === 'admin' && (user?.role !== 'admin' && user?.role !== 'superadmin')) {
            return <Navigate to="/unauthorized" replace />;
        }
        // For user routes, only allow 'user' role
        else if (requiredRole === 'user' && user?.role !== 'user') {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;

