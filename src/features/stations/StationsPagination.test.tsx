import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { buildSession, buildStation } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StationsListPage } from './StationsListPage';
import { stationsApi } from './stationsApi';

vi.mock('./stationsApi', () => ({ stationsApi: { list: vi.fn() } }));

describe('paginação da lista de estações (SCRUM-158 — RF2 R2)', () => {
  it('mostra o total e vai para a próxima página', async () => {
    vi.mocked(stationsApi.list).mockImplementation(async (filters = {}) => ({
      data: [buildStation({ name: `Estação da página ${filters.page}` })],
      meta: { total: 45, page: filters.page ?? 1, perPage: 20, totalPages: 3 },
    }));
    renderWithProviders(
      <Routes>
        <Route path="/estacoes" element={<StationsListPage />} />
      </Routes>,
      { route: '/estacoes', session: buildSession() },
    );

    expect(await screen.findByText(/Página 1 de 3 · 45 registros/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }));

    expect(await screen.findByText('Estação da página 2')).toBeInTheDocument();
    expect(stationsApi.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
  });
});
