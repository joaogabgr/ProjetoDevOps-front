import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { buildSession, buildUser } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { UserEditPage } from './UserEditPage';
import { usersApi } from './usersApi';

vi.mock('./usersApi', () => ({ usersApi: { list: vi.fn(), update: vi.fn() } }));

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/usuarios/:id/editar" element={<UserEditPage />} />
      <Route path="/usuarios" element={<p>Lista de usuários</p>} />
    </Routes>,
    { route: '/usuarios/u-2/editar', session: buildSession() },
  );
}

describe('edição de usuário (SCRUM-78 — RF5)', () => {
  beforeEach(() => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: [buildUser({ id: 'u-2', name: 'Bruno', email: 'bruno@vigia.org', role: 'TECHNICIAN' })],
      meta: { total: 1, page: 1, perPage: 100, totalPages: 1 },
    });
  });

  it('carrega pelo endereço, não mostra CPF nem senha e salva', async () => {
    vi.mocked(usersApi.update).mockResolvedValue(buildUser());
    renderPage();

    const name = await screen.findByLabelText('Nome');
    expect(name).toHaveValue('Bruno');
    expect(screen.queryByLabelText('CPF')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Perfil'), 'ADMIN');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByText('Lista de usuários')).toBeInTheDocument();
    expect(usersApi.update).toHaveBeenCalledWith('u-2', expect.objectContaining({ role: 'ADMIN', community: null }));
  });

  it('CA2: mostra a recusa do último administrador', async () => {
    vi.mocked(usersApi.update).mockRejectedValue(
      new ApiError(409, 'CONFLICT', 'Não é possível remover o último administrador ativo.'),
    );
    renderPage();

    await screen.findByLabelText('Nome');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByText('Não é possível remover o último administrador ativo.')).toBeInTheDocument();
  });
});
