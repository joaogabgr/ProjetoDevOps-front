export interface MenuItem {
  to: string;
  label: string;
}

/** Itens do menu principal. */
export const MENU: MenuItem[] = [
  { to: '/estacoes', label: 'Estações' },
  { to: '/parametros', label: 'Parâmetros' },
  { to: '/usuarios', label: 'Usuários' },
];
