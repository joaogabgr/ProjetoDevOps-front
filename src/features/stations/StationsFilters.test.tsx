import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { buildSession } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StationsListPage } from './StationsListPage';
import { stationsApi } from './stationsApi';

vi.mock('./stationsApi', () => ({ stationsApi: { list: vi.fn() } }));

describe('filtros da lista de estações (SCRUM-157 — RF2 R2)', () => {
  beforeEach(() => {
    vi.mocked(stationsApi.list).mockResolvedValue({ data: [], meta: { total: 0, page: 1, perPage: 20, totalPages: 0 } });
  });

  it('CA4: filtra por bioma e situação e volta para a página 1', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/estacoes" element={<StationsListPage />} />
      </Routes>,
      { route: '/estacoes?pagina=3', session: buildSession() },
    );

    await userEvent.selectOptions(await screen.findByLabelText('Bioma'), 'CERRADO');
    await userEvent.selectOptions(screen.getByLabelText('Situação'), 'active');

    expect(stationsApi.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, biome: 'CERRADO', status: 'active' }));
  });

  it('lê os filtros do endereço', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/estacoes" element={<StationsListPage />} />
      </Routes>,
      { route: '/estacoes?comunidade=S%C3%A3o%20Benedito&nome=Rio', session: buildSession() },
    );

    expect(await screen.findByLabelText('Comunidade')).toHaveValue('São Benedito');
    expect(stationsApi.list).toHaveBeenCalledWith(expect.objectContaining({ community: 'São Benedito', name: 'Rio' }));
  });
});
