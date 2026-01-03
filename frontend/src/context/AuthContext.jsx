import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const savedUser = localStorage.getItem('user');

        if (userId && savedUser) {
            setUser(JSON.parse(savedUser));
            // Verify user still exists
            api.get('/auth/me')
                .then(res => {
                    setUser(res.data.user);
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                })
                .catch(() => {
                    localStorage.removeItem('userId');
                    localStorage.removeItem('user');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        const { user } = response.data;
        localStorage.setItem('userId', user.id.toString());
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return response.data;
    };

    const register = async (username, password, displayName) => {
        const response = await api.post('/auth/register', { username, password, displayName });
        const { user } = response.data;
        localStorage.setItem('userId', user.id.toString());
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
