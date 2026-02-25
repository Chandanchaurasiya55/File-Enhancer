import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL ;

    // Check authentication on app load using cookie
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include' // Send cookies with request
                });

                const data = await response.json();

                if (data.success) {
                    setUser(data.user);
                    setToken('authenticated'); // Token exists in cookie
                    setError(null);
                } else {
                    setUser(null);
                    setToken(null);
                    setError(null);
                }
            } catch (err) {
                console.error('Auth check error:', err);
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Send cookies with request
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                setToken('authenticated'); // Token exists in cookie
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
                credentials: 'include', // Send cookies with request
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                setToken('authenticated'); // Token is now in cookie
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
                credentials: 'include', // Send cookies with request
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (data.success) {
                setToken('authenticated'); // Token is now in cookie
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
                credentials: 'include', // Send cookies with request
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                setToken('authenticated'); // Token is now in cookie
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
                credentials: 'include', // Send cookies with request
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (data.success) {
                setToken('authenticated'); // Token is now in cookie
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
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Send cookies with request to clear them
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