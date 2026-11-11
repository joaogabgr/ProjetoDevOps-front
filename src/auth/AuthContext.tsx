import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, configureApi } from '../api/client';
import type { User } from '../api/types';
import { clearSession, isExpired, loadSession, saveSession, type Session } from './session';

interface AuthApi {
  session: Session | null;
  user: User | null;
  /** Por que a última sessão acabou: vencida (8 horas ou 401 da API). */
  endedBy: 'expired' | null;
  login(email: string, password: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthApi | null>(null);

/** Sessão do usuário logado (RF9): login, logout e token nas chamadas à API. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession);
  const [endedBy, setEndedBy] = useState<'expired' | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const expire = useCallback(() => {
    clearSession();
    setSession(null);
    setEndedBy('expired');
  }, []);

  useEffect(() => {
    configureApi({
      token: () => sessionRef.current?.token ?? null,
      onUnauthorized: () => {
        if (sessionRef.current) expire();
      },
    });
  }, [expire]);

  // Encerra sozinho quando a sessão de 8 horas vence, mesmo sem chamar a API.
  useEffect(() => {
    if (!session) return;
    if (isExpired(session)) {
      expire();
      return;
    }
    const timer = window.setTimeout(expire, new Date(session.expiresAt).getTime() - Date.now());
    return () => window.clearTimeout(timer);
  }, [session, expire]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ data: Session }>('/auth/login', { email, password });
    saveSession(data);
    setSession(data);
    setEndedBy(null);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setEndedBy(null);
  }, []);

  const value = useMemo<AuthApi>(
    () => ({ session, user: session?.user ?? null, endedBy, login, logout }),
    [session, endedBy, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa de <AuthProvider>.');
  return context;
}
