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
import type { AuthResponse, LoginRequest } from '@/types';

interface AuthState {
  user: (AuthResponse & { displayName?: string }) | null;
  token: string | null;
  loading: boolean;
  isDemo: boolean;
  backendUrl: string;
  login: (data: LoginRequest) => Promise<void>;
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

  const loginDemo = async (role: 'platform' | 'tenant' = 'platform') => {
    setDemoMode(true);
    const username = role === 'platform' ? 'platform-admin' : 'tenant-admin';
    await login({ username, password: 'password' });
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
        backendUrl,
        login,
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
