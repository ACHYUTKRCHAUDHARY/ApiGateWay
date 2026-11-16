import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gatekeeper_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('gatekeeper_token');
      const storedUser = localStorage.getItem('gatekeeper_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const meRes = await api.getMe();
          if (meRes && meRes.data) {
            setUser(meRes.data);
            localStorage.setItem('gatekeeper_user', JSON.stringify(meRes.data));
          }
        } catch (e) {
          console.warn('Session expired or invalid token:', e);
          // Keep cached user for offline/demo if valid
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.login(username, password);
      if (res && res.data && res.data.token) {
        const authToken = res.data.token;
        const userData = {
          username: res.data.username,
          role: res.data.role,
          organizationId: res.data.organizationId,
          organizationName: res.data.organizationName
        };

        setToken(authToken);
        setUser(userData);
        localStorage.setItem('gatekeeper_token', authToken);
        localStorage.setItem('gatekeeper_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gatekeeper_token');
    localStorage.removeItem('gatekeeper_user');
  };

  const isPlatformAdmin = user && user.role === 'PLATFORM_ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!token,
      isPlatformAdmin
    }}>
      {children}
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

