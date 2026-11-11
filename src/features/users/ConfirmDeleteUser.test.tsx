import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { buildSession, buildUser } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { UsersListPage } from './UsersListPage';
import { usersApi } from './usersApi';

vi.mock('./usersApi', () => ({ usersApi: { list: vi.fn(), remove: vi.fn() } }));

describe('confirmação antes de excluir usuário (SCRUM-178 — RNF1 R4)', () => {
  it('só exclui depois de confirmar', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({ data: [buildUser({ id: 'u-2', name: 'Bruno' })], meta: { total: 1, page: 1, perPage: 20, totalPages: 1 } });
    vi.mocked(usersApi.remove).mockResolvedValue(undefined);
    renderWithProviders(
      <Routes>
        <Route path="/usuarios" element={<UsersListPage />} />
      </Routes>,
      { route: '/usuarios', session: buildSession() },
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Excluir o usuário Bruno?');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(usersApi.remove).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Excluir' }).at(-1)!);
    expect(usersApi.remove).toHaveBeenCalledWith('u-2');
  });
});
