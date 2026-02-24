import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL ;

    // Set token in localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    // Fetch current user
    useEffect(() => {
        if (token) {
            fetchCurrentUser();
        }
    }, [token]);

    const fetchCurrentUser = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                setError(null);
            } else {
                setUser(null);
                setToken(null);
                setError(data.message);
            }
        } catch (err) {
            setUser(null);
            setToken(null);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const userSignup = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/auth/user/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                return { success: true, message: data.message };
            } else {
                setError(data.message);
                return { success: false, message: data.message };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const userLogin = async (credentials) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/auth/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                return { success: true, message: data.message };
            } else {
                setError(data.message);
                return { success: false, message: data.message };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const adminSignup = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/auth/admin/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                return { success: true, message: data.message };
            } else {
                setError(data.message);
                return { success: false, message: data.message };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const adminLogin = async (credentials) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/auth/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                return { success: true, message: data.message };
            } else {
                setError(data.message);
                return { success: false, message: data.message };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setToken(null);
            setUser(null);
            setError(null);
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        token,
        loading,
        error,
        userSignup,
        userLogin,
        adminSignup,
        adminLogin,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
        isUser: user?.role === 'user'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


export { AuthProvider, AuthContext, useAuth };