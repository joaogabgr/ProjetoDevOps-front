import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { buildSession } from '../test/fixtures';
import { renderWithProviders } from '../test/render';

function mockLogin(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })),
  );
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText('E-mail'), 'ana@vigia.org');
  await userEvent.type(screen.getByLabelText('Senha'), 'senha-certa');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('tela de login (SCRUM-117 — RF9)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sem sessão, qualquer página leva para o login', () => {
    renderWithProviders(<App />, { route: '/' });

    expect(screen.getByRole('heading', { name: 'Vigia das Águas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
  });

  it('CA1: entra e volta para a página que tentou abrir', async () => {
    mockLogin(200, { data: buildSession({ name: 'Ana' }) });
    renderWithProviders(<App />, { route: '/' });

    await fillAndSubmit();

    expect(await screen.findByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument();
  });

  it('CA2: senha errada mostra a mensagem da API e continua no login', async () => {
    mockLogin(401, { error: { code: 'UNAUTHORIZED', message: 'E-mail ou senha incorretos.' } });
    renderWithProviders(<App />, { route: '/' });

    await fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  });

  it('CA3: usuário desativado vê a mensagem do RF9', async () => {
    mockLogin(403, { error: { code: 'FORBIDDEN', message: 'Usuário desativado. Fale com o administrador.' } });
    renderWithProviders(<App />, { route: '/' });

    await fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuário desativado. Fale com o administrador.');
  });

  it('quem já está logado não vê o login', () => {
    renderWithProviders(<App />, { route: '/entrar', session: buildSession() });

    expect(screen.getByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument();
  });
});
