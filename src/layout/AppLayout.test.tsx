import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../test/render';
import { AppLayout } from './AppLayout';

function renderLayout() {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<p>Início</p>} />
        <Route path="estacoes" element={<p>Lista de estações</p>} />
      </Route>
    </Routes>,
  );
}

describe('AppLayout (SCRUM-238 — RNF1 R1)', () => {
  it('mostra o menu com as páginas e o conteúdo', () => {
    renderLayout();

    const menu = screen.getByRole('navigation', { name: 'Menu principal' });
    expect(menu).toHaveTextContent('Estações');
    expect(menu).toHaveTextContent('Parâmetros');
    expect(menu).toHaveTextContent('Usuários');
    expect(screen.getByText('Início')).toBeInTheDocument();
  });

  it('no celular o botão abre o menu e ele fecha ao escolher uma página', async () => {
    renderLayout();
    const button = screen.getByRole('button', { name: 'Menu' });

    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(screen.getByRole('link', { name: 'Estações' }));
    expect(screen.getByText('Lista de estações')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
