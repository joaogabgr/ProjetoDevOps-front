import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, configureApi } from '../api/client';
import type { User } from '../api/types';
import { clearSession, loadSession, saveSession, type Session } from './session';

interface AuthApi {
  session: Session | null;
  user: User | null;
  login(email: string, password: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthApi | null>(null);

/** Sessão do usuário logado (RF9): login, logout e token nas chamadas à API. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    configureApi({ token: () => sessionRef.current?.token ?? null });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ data: Session }>('/auth/login', { email, password });
    saveSession(data);
    setSession(data);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthApi>(
    () => ({ session, user: session?.user ?? null, login, logout }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa de <AuthProvider>.');
  return context;
}
