import type { Role } from '../api/types';

/** Mesma matriz do back (RF9), para esconder o que o perfil não pode fazer (R7). */
export const PERMISSIONS = {
  MANAGE_USERS: ['ADMIN'],
  MANAGE_STATIONS: ['ADMIN', 'TECHNICIAN'],
  MANAGE_ALERTS: ['ADMIN'],
  VIEW_STATIONS: ['ADMIN', 'TECHNICIAN', 'COMMUNITY_AGENT'],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role | undefined, permission: Permission): boolean {
  return !!role && (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
