import { screen } from '@testing-library/react';
import { App } from '../App';
import { buildSession } from '../test/fixtures';
import { renderWithProviders } from '../test/render';

describe('acesso negado (SCRUM-218 — RF9 R6)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('403 ao abrir a lista de usuários leva para a página de acesso negado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Você não tem permissão para esta ação.' } }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    renderWithProviders(<App />, { route: '/usuarios', session: buildSession({ role: 'TECHNICIAN' }) });

    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    expect(screen.getByText('Você não tem permissão para esta ação.')).toBeInTheDocument();
  });
});
