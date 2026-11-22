// ═══════════════════════════════════════════════════════════════
// Auth Context — JWT storage + user state + demo sandbox status
// ═══════════════════════════════════════════════════════════════
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  getToken,
  setToken as persistToken,
  isDemoMode,
  setDemoMode,
  getBackendUrl,
  setBackendUrl as persistBackendUrl,
} from '@/services/api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

interface AuthState {
  user: (AuthResponse & { displayName?: string }) | null;
  token: string | null;
  loading: boolean;
  isDemo: boolean;
  isAuthenticated: boolean;
  backendUrl: string;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  signup: (data: RegisterRequest) => Promise<void>;
  loginDemo: (role?: 'platform' | 'tenant') => Promise<void>;
  logout: () => void;
  updateBackendUrl: (url: string | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null);
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [loading, setLoading] = useState<boolean>(() => !!getToken());
  const [isDemo, setIsDemo] = useState<boolean>(() => isDemoMode());
  const [backendUrl, setBackendUrlState] = useState<string>(() => getBackendUrl());

  const logout = useCallback(() => {
    persistToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  // Bootstrap: if we have a token, fetch profile
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        setUser({
          token,
          tokenType: 'Bearer',
          username: res.data.username,
          role: res.data.role,
          organizationId: res.data.organizationId,
          organizationName: res.data.organizationName,
          displayName: res.data.username,
        });
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token, logout]);

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data);
    const auth = res.data;
    persistToken(auth.token);
    setTokenState(auth.token);
    setIsDemo(isDemoMode());
    setUser({ ...auth, displayName: auth.username });
  };

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    const auth = res.data;
    persistToken(auth.token);
    setTokenState(auth.token);
    setIsDemo(isDemoMode());
    setUser({ ...auth, displayName: auth.username });
  };

  const loginDemo = async (role: 'platform' | 'tenant' = 'platform') => {
    const username = role === 'platform' ? 'platform-admin' : 'tenant-admin';
    try {
      setDemoMode(false);
      await login({ username, password: 'admin123' });
    } catch {
      setDemoMode(true);
      await login({ username, password: 'password' });
    }
  };

  const updateBackendUrl = (url: string | null) => {
    persistBackendUrl(url);
    setBackendUrlState(getBackendUrl());
    if (url) {
      setDemoMode(false);
      setIsDemo(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isDemo,
        isAuthenticated: !!user || !!token,
        backendUrl,
        login,
        register,
        signup: register,
        loginDemo,
        logout,
        updateBackendUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
