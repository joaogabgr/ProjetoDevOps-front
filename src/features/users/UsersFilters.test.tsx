import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { buildSession, buildUser } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { UsersListPage } from './UsersListPage';
import { usersApi } from './usersApi';

vi.mock('./usersApi', () => ({ usersApi: { list: vi.fn() } }));

describe('filtros e paginação de usuários (SCRUM-177 — RF5 R6)', () => {
  it('filtra por perfil e comunidade e troca de página', async () => {
    vi.mocked(usersApi.list).mockImplementation(async (filters = {}) => ({
      data: [buildUser({ name: `Usuário da página ${filters.page}` })],
      meta: { total: 30, page: filters.page ?? 1, perPage: 20, totalPages: 2 },
    }));
    renderWithProviders(
      <Routes>
        <Route path="/usuarios" element={<UsersListPage />} />
      </Routes>,
      { route: '/usuarios', session: buildSession() },
    );

    await userEvent.selectOptions(await screen.findByLabelText('Perfil'), 'COMMUNITY_AGENT');
    await userEvent.type(screen.getByLabelText('Comunidade'), 'S');
    expect(usersApi.list).toHaveBeenLastCalledWith(expect.objectContaining({ role: 'COMMUNITY_AGENT', community: 'S', page: 1 }));

    await userEvent.click(await screen.findByRole('button', { name: 'Próxima' }));
    expect(await screen.findByText('Usuário da página 2')).toBeInTheDocument();
  });
});
