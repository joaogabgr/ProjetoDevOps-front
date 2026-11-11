import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { buildSession, buildStation } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StationsListPage } from './StationsListPage';
import { stationsApi } from './stationsApi';

vi.mock('./stationsApi', () => ({ stationsApi: { list: vi.fn() } }));

const page = (data: ReturnType<typeof buildStation>[]) => ({
  data,
  meta: { total: data.length, page: 1, perPage: 20, totalPages: data.length ? 1 : 0 },
});

function renderPage(route = '/estacoes') {
  return renderWithProviders(
    <Routes>
      <Route path="/estacoes" element={<StationsListPage />} />
    </Routes>,
    { route, session: buildSession() },
  );
}

describe('lista de estações (SCRUM-61 — RF2)', () => {
  it('mostra as estações com bioma, comunidade e situação', async () => {
    vi.mocked(stationsApi.list).mockResolvedValue(
      page([
        buildStation({ id: '1', uuid: 'PCD-CER-02', name: 'Córrego Fundo', biome: 'CERRADO', community: 'Vila Goiás', active: false }),
        buildStation({ id: '2', uuid: 'PCD-PAN-03', name: 'Rio Miranda' }),
      ]),
    );

    renderPage();

    expect(await screen.findByText('Córrego Fundo')).toBeInTheDocument();
    expect(screen.getByText('PCD-CER-02')).toBeInTheDocument();
    expect(screen.getByText('Cerrado')).toBeInTheDocument();
    expect(screen.getByText('Desativada')).toBeInTheDocument();
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nova estação' })).toHaveAttribute('href', '/estacoes/nova');
  });

  it('avisa quando não há estações', async () => {
    vi.mocked(stationsApi.list).mockResolvedValue(page([]));

    renderPage();

    expect(await screen.findByText('Nenhuma estação encontrada.')).toBeInTheDocument();
  });

  it('mostra o erro da API', async () => {
    vi.mocked(stationsApi.list).mockRejectedValue(new ApiError(0, 'NETWORK_ERROR', 'Não foi possível falar com o servidor.'));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível falar com o servidor.');
  });

  it('pede a página que está no endereço', async () => {
    vi.mocked(stationsApi.list).mockResolvedValue(page([]));

    renderPage('/estacoes?pagina=3');

    await screen.findByText('Nenhuma estação encontrada.');
    expect(stationsApi.list).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }));
  });
});
