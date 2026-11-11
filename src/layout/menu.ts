import type { Permission } from '../auth/permissions';

export interface MenuItem {
  to: string;
  label: string;
  permission: Permission;
}

/** Itens do menu principal. */
export const MENU: MenuItem[] = [
  { to: '/estacoes', label: 'Estações', permission: 'VIEW_STATIONS' },
  { to: '/parametros', label: 'Parâmetros', permission: 'VIEW_STATIONS' },
  { to: '/usuarios', label: 'Usuários', permission: 'MANAGE_USERS' },
];
