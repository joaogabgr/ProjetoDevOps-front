import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { buildSession, buildUser } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { UserCreatePage } from './UserCreatePage';
import { usersApi } from './usersApi';

vi.mock('./usersApi', () => ({ usersApi: { create: vi.fn() } }));

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/usuarios/novo" element={<UserCreatePage />} />
      <Route path="/usuarios" element={<p>Lista de usuários</p>} />
    </Routes>,
    { route: '/usuarios/novo', session: buildSession() },
  );
}

async function fill() {
  await userEvent.type(screen.getByLabelText('Nome'), 'Maria das Dores');
  await userEvent.type(screen.getByLabelText('E-mail'), 'maria@vigia.org');
  await userEvent.type(screen.getByLabelText('CPF'), '529.982.247-25');
  await userEvent.type(screen.getByLabelText('Senha'), 'senha-forte');
}

describe('cadastro de usuário (SCRUM-75 — RF5)', () => {
  it('cadastra um agente comunitário com a comunidade', async () => {
    vi.mocked(usersApi.create).mockResolvedValue(buildUser());
    renderPage();

    await fill();
    await userEvent.selectOptions(screen.getByLabelText('Perfil'), 'COMMUNITY_AGENT');
    await userEvent.type(screen.getByLabelText('Comunidade'), 'São Benedito');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar usuário' }));

    expect(await screen.findByText('Lista de usuários')).toBeInTheDocument();
    expect(screen.getByText('Usuário cadastrado.')).toBeInTheDocument();
    expect(usersApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'maria@vigia.org', role: 'COMMUNITY_AGENT', community: 'São Benedito' }),
    );
  });

  it('técnico de campo vai sem comunidade', async () => {
    vi.mocked(usersApi.create).mockResolvedValue(buildUser());
    renderPage();

    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar usuário' }));

    await screen.findByText('Lista de usuários');
    expect(usersApi.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'TECHNICIAN', community: null }));
  });

  it('mostra ao lado do campo o erro de comunidade da API', async () => {
    vi.mocked(usersApi.create).mockRejectedValue(
      new ApiError(422, 'VALIDATION_ERROR', 'Informe a comunidade do agente comunitário.', [
        { field: 'community', message: 'Informe a comunidade do agente comunitário.' },
      ]),
    );
    renderPage();

    await fill();
    await userEvent.selectOptions(screen.getByLabelText('Perfil'), 'COMMUNITY_AGENT');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar usuário' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Informe a comunidade do agente comunitário.');
    expect(screen.getByLabelText('E-mail')).toHaveValue('maria@vigia.org');
  });
});
