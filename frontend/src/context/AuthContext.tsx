// ═══════════════════════════════════════════════════════════════
// Auth Context — JWT storage + user state
// ═══════════════════════════════════════════════════════════════
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, getToken, setToken as persistToken } from '@/services/api';
import type { AuthResponse, UserProfile, LoginRequest } from '@/types';

interface AuthState {
  user: (AuthResponse & { displayName?: string }) | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null);
  // Lazy state initialization to prevent reading storage on every render (Vercel rerender-lazy-state-init)
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [loading, setLoading] = useState<boolean>(() => !!getToken());

  const logout = useCallback(() => {
    persistToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  // Bootstrap: if we have a token, fetch profile
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(res => {
        setUser({ token, tokenType: 'Bearer', username: res.data.username, role: res.data.role, organizationId: res.data.organizationId, organizationName: res.data.organizationName, displayName: res.data.username });
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token, logout]);

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data);
    const auth = res.data;
    persistToken(auth.token);
    setTokenState(auth.token);
    setUser({ ...auth, displayName: auth.username });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
