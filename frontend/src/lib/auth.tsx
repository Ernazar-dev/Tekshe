import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStore, UNAUTHORIZED_EVENT } from './api';
import type { RegisterInput, User } from './types';

interface AuthState {
  user: User | null;
  /** Saqlanǵan token boyınsha paydalanıwshı tekserilip atır */
  loading: boolean;
  login: (login: string, password: string) => Promise<User>;
  register: (data: RegisterInput) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!tokenStore.get());

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    // Aldınǵı paydalanıwshınıń maǵlıwmatları keshte qalıp qoymawı kerek
    queryClient.clear();
  }, [queryClient]);

  // Bet jańalanǵanda saqlanǵan token boyınsha kirgen paydalanıwshını tiklew
  useEffect(() => {
    if (!tokenStore.get()) return;
    let alive = true;
    api
      .me()
      .then((u) => alive && setUser(u))
      .catch(() => alive && tokenStore.clear())
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const value = useMemo<AuthState>(() => {
    const accept = ({ token, user: u }: { token: string; user: User }) => {
      queryClient.clear();
      tokenStore.set(token);
      setUser(u);
      return u;
    };
    return {
      user,
      loading,
      login: async (login, password) => accept(await api.login(login, password)),
      register: async (data) => accept(await api.register(data)),
      logout,
      setUser,
    };
  }, [user, loading, logout, queryClient]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth tek AuthProvider ishinde isleydi');
  return ctx;
};
