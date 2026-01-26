import { createContext, useContext, useState, useEffect } from 'react';
import api, { getRefreshToken, setTokens, clearTokens } from '../api/client';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:8787';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            const storedRefreshToken = getRefreshToken();

            if (storedRefreshToken) {
                try {
                    // Try to refresh the token and get user
                    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken: storedRefreshToken }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setTokens(data.accessToken, data.refreshToken);

                        // Fetch current user
                        const userResponse = await api.getCurrentUser();
                        setUser(userResponse.user);
                    } else {
                        clearTokens();
                    }
                } catch (error) {
                    console.error('Auth init error:', error);
                    clearTokens();
                }
            }

            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        const data = await api.login(email, password);

        // Fetch full user profile
        const userResponse = await api.getCurrentUser();
        setUser(userResponse.user);

        return data;
    };

    const register = async (userData) => {
        return api.register(userData);
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
