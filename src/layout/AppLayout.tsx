import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { can } from '../auth/permissions';
import { MENU } from './menu';

/** Moldura das páginas logadas: cabeçalho, menu e conteúdo (RNF1 R1). */
export function AppLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // No celular o menu fecha depois de escolher uma página.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className="layout">
      <header className="layout__header">
        <button
          type="button"
          className="layout__menu-button"
          aria-expanded={menuOpen}
          aria-controls="menu-principal"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
        <NavLink to="/" className="layout__brand">
          Vigia das Águas
        </NavLink>
        <div className="layout__header-end">
          <span className="layout__user">{user?.name}</span>
          <button type="button" className="layout__menu-button layout__logout" onClick={logout}>
            Sair
          </button>
        </div>
      </header>
      <nav id="menu-principal" className={menuOpen ? 'layout__nav layout__nav--open' : 'layout__nav'} aria-label="Menu principal">
        <ul>
          {MENU.filter((item) => can(user?.role, item.permission)).map((item) => (
            <li key={item.to}>
              <NavLink to={item.to}>{item.label}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  );
}
