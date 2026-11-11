import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { buildSession, buildStation } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StationsListPage } from './StationsListPage';
import { stationsApi } from './stationsApi';

vi.mock('./stationsApi', () => ({ stationsApi: { list: vi.fn(), setActive: vi.fn(), remove: vi.fn() } }));

async function confirmDelete() {
  await userEvent.click(await screen.findByRole('button', { name: 'Excluir' }));
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }));
}

function listWith(station: ReturnType<typeof buildStation>) {
  vi.mocked(stationsApi.list).mockResolvedValue({ data: [station], meta: { total: 1, page: 1, perPage: 20, totalPages: 1 } });
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/estacoes" element={<StationsListPage />} />
    </Routes>,
    { route: '/estacoes', session: buildSession() },
  );
}

describe('excluir e desativar estação (SCRUM-64 — RF2 R3 e R4)', () => {
  it('desativa e recarrega a lista', async () => {
    listWith(buildStation({ id: 's-1', active: true }));
    vi.mocked(stationsApi.setActive).mockResolvedValue(buildStation({ active: false }));
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Desativar' }));

    expect(stationsApi.setActive).toHaveBeenCalledWith('s-1', false);
    expect(await screen.findByText('Estação desativada.')).toBeInTheDocument();
    expect(stationsApi.list).toHaveBeenCalledTimes(2);
  });

  it('estação desativada pode ser reativada', async () => {
    listWith(buildStation({ id: 's-1', active: false }));
    vi.mocked(stationsApi.setActive).mockResolvedValue(buildStation({ active: true }));
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Reativar' }));

    expect(stationsApi.setActive).toHaveBeenCalledWith('s-1', true);
  });

  it('CA2: mostra a recusa da API para estação com leituras', async () => {
    listWith(buildStation({ id: 's-1' }));
    vi.mocked(stationsApi.remove).mockRejectedValue(
      new ApiError(409, 'CONFLICT', 'Estação com leituras não pode ser excluída. Desative-a.'),
    );
    renderPage();

    await confirmDelete();

    expect(await screen.findByText('Estação com leituras não pode ser excluída. Desative-a.')).toBeInTheDocument();
  });

  it('exclui estação sem leituras', async () => {
    listWith(buildStation({ id: 's-1' }));
    vi.mocked(stationsApi.remove).mockResolvedValue(undefined);
    renderPage();

    await confirmDelete();

    expect(await screen.findByText('Estação excluída.')).toBeInTheDocument();
    expect(stationsApi.remove).toHaveBeenCalledWith('s-1');
  });
});
