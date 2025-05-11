import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios';
import { API_ENDPOINTS } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            // Login request - no token needed
            const response = await axios.post(API_ENDPOINTS.LOGIN, {
                username,
                password
            });

            const { token, user } = response.data;
            
            // Store token for future requests
            localStorage.setItem('token', token);
            
            // Update auth state
            setIsAuthenticated(true);
            setUser(user);
            
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed. Please try again.'
            };
        }
    };

    const logout = () => {
        // Clear token and user data
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    const value = {
        isAuthenticated,
        isLoading,
        user,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
