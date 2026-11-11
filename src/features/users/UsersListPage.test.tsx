import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { buildSession, buildUser } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { UsersListPage } from './UsersListPage';
import { usersApi } from './usersApi';

vi.mock('./usersApi', () => ({ usersApi: { list: vi.fn() } }));

describe('lista de usuários (SCRUM-81 — RF5)', () => {
  it('mostra perfil, comunidade e situação de cada usuário', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: [
        buildUser({ id: '1', name: 'Ana', role: 'ADMIN' }),
        buildUser({ id: '2', name: 'Bia', email: 'bia@vigia.org', role: 'COMMUNITY_AGENT', community: 'São Benedito', active: false }),
      ],
      meta: { total: 2, page: 1, perPage: 20, totalPages: 1 },
    });

    renderWithProviders(
      <Routes>
        <Route path="/usuarios" element={<UsersListPage />} />
      </Routes>,
      { route: '/usuarios', session: buildSession() },
    );

    expect(await screen.findByText('Bia')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Agente comunitário')).toBeInTheDocument();
    expect(screen.getByText('São Benedito')).toBeInTheDocument();
    expect(screen.getByText('Desativado')).toBeInTheDocument();
    expect(screen.queryByText(/senha/i)).not.toBeInTheDocument();
  });
});
