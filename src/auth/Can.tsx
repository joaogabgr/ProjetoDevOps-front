import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { can, type Permission } from './permissions';

/** Mostra o conteúdo só para quem tem a permissão. */
export function Can({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { user } = useAuth();
  return can(user?.role, permission) ? <>{children}</> : null;
}
