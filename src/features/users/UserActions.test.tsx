import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { buildSession, buildUser } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { UsersListPage } from './UsersListPage';
import { usersApi } from './usersApi';

vi.mock('./usersApi', () => ({ usersApi: { list: vi.fn(), update: vi.fn(), remove: vi.fn() } }));

function renderWith(user: ReturnType<typeof buildUser>) {
  vi.mocked(usersApi.list).mockResolvedValue({ data: [user], meta: { total: 1, page: 1, perPage: 20, totalPages: 1 } });
  return renderWithProviders(
    <Routes>
      <Route path="/usuarios" element={<UsersListPage />} />
    </Routes>,
    { route: '/usuarios', session: buildSession() },
  );
}

describe('excluir e desativar usuário (SCRUM-83 — RF5)', () => {
  it('desativa o usuário', async () => {
    vi.mocked(usersApi.update).mockResolvedValue(buildUser({ active: false }));
    renderWith(buildUser({ id: 'u-2', active: true }));

    await userEvent.click(await screen.findByRole('button', { name: 'Desativar' }));

    expect(usersApi.update).toHaveBeenCalledWith('u-2', { active: false });
    expect(await screen.findByText('Usuário desativado.')).toBeInTheDocument();
  });

  it('CA2: mostra a recusa de excluir o último administrador', async () => {
    vi.mocked(usersApi.remove).mockRejectedValue(new ApiError(409, 'CONFLICT', 'Não é possível excluir o último administrador ativo.'));
    renderWith(buildUser({ id: 'u-1', role: 'ADMIN' }));

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir' }));

    expect(await screen.findByText('Não é possível excluir o último administrador ativo.')).toBeInTheDocument();
  });

  it('exclui o usuário', async () => {
    vi.mocked(usersApi.remove).mockResolvedValue(undefined);
    renderWith(buildUser({ id: 'u-3' }));

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir' }));

    expect(await screen.findByText('Usuário excluído.')).toBeInTheDocument();
    expect(usersApi.remove).toHaveBeenCalledWith('u-3');
  });
});
