import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { api } from '../api/client';
import { buildSession } from '../test/fixtures';
import { renderWithProviders } from '../test/render';

describe('fim da sessão (SCRUM-214 — RF9 R3)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('o botão Sair volta para o login', async () => {
    renderWithProviders(<App />, { session: buildSession({ name: 'Ana Técnica' }) });
    expect(screen.getByText('Ana Técnica')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.queryByText('Sua sessão expirou. Entre novamente.')).not.toBeInTheDocument();
  });

  it('CA4: quando a API responde 401, volta ao login com o aviso de sessão expirada', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Sessão expirada. Entre novamente.' } }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    renderWithProviders(<App />, { session: buildSession() });

    await act(() => api.get('/stations').catch(() => {}));

    expect(screen.getByRole('status')).toHaveTextContent('Sua sessão expirou. Entre novamente.');
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('CA4: depois de 8 horas a sessão acaba sozinha', () => {
    vi.useFakeTimers();
    renderWithProviders(<App />, { session: buildSession({}, 8) });
    expect(screen.getByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(8 * 3_600_000 + 1000));

    expect(screen.getByText('Sua sessão expirou. Entre novamente.')).toBeInTheDocument();
  });
});
