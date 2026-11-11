import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { buildSession, buildTypeParameter } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StationCreatePage } from './StationCreatePage';

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })),
  );
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/estacoes/nova" element={<StationCreatePage />} />
    </Routes>,
    { route: '/estacoes/nova', session: buildSession() },
  );
}

describe('parâmetros no cadastro de estação (SCRUM-145 — RF1)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('mostra os parâmetros cadastrados com nome e unidade', async () => {
    mockFetch(200, {
      data: [
        buildTypeParameter({ id: '6', typeJson: 'chuva', name: 'Índice Pluviométrico', unit: 'mm' }),
        buildTypeParameter({ id: '7', typeJson: 'nivel', name: 'Nível do Rio', unit: 'cm' }),
      ],
    });

    renderPage();

    expect(await screen.findByText(/Nível do Rio \(cm\)/)).toBeInTheDocument();
    expect(screen.getByText(/Índice Pluviométrico \(mm\)/)).toBeInTheDocument();
  });

  it('avisa quando não consegue carregar os parâmetros', async () => {
    mockFetch(500, { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' } });

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro interno do servidor.');
  });
});
