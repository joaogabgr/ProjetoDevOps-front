import type { User } from '../api/types';

export interface Session {
  token: string;
  /** ISO 8601; a sessão vale 8 horas (RF9 R3). */
  expiresAt: string;
  user: User;
}

const KEY = 'vigia.sessao';

export function isExpired(session: Session, now = Date.now()): boolean {
  return new Date(session.expiresAt).getTime() <= now;
}

/** Sessão guardada no navegador, ou `null` se não houver, estiver corrompida ou vencida. */
export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (!session.token || !session.expiresAt || isExpired(session)) {
      localStorage.removeItem(KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Navegador sem armazenamento: a sessão vale só enquanto a aba estiver aberta.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nada a limpar
  }
}
