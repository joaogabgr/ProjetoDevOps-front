import { screen, within } from '@testing-library/react';
import { App } from '../App';
import { stationsApi } from '../features/stations/stationsApi';
import { buildSession, buildStation } from '../test/fixtures';
import { renderWithProviders } from '../test/render';
import { can } from './permissions';

vi.mock('../features/stations/stationsApi', () => ({ stationsApi: { list: vi.fn() } }));

describe('menus e botões por perfil (SCRUM-85 — RF9 R7)', () => {
  beforeEach(() => {
    vi.mocked(stationsApi.list).mockResolvedValue({
      data: [buildStation()],
      meta: { total: 1, page: 1, perPage: 20, totalPages: 1 },
    });
  });

  it('CA3: técnico de campo não vê o menu Usuários', () => {
    renderWithProviders(<App />, { session: buildSession({ role: 'TECHNICIAN' }) });

    const menu = screen.getByRole('navigation', { name: 'Menu principal' });
    expect(within(menu).getByText('Estações')).toBeInTheDocument();
    expect(within(menu).queryByText('Usuários')).not.toBeInTheDocument();
  });

  it('administrador vê todos os menus', () => {
    renderWithProviders(<App />, { session: buildSession({ role: 'ADMIN' }) });

    expect(within(screen.getByRole('navigation', { name: 'Menu principal' })).getByText('Usuários')).toBeInTheDocument();
  });

  it('agente comunitário vê as estações sem os botões de gerenciar', async () => {
    renderWithProviders(<App />, { route: '/estacoes', session: buildSession({ role: 'COMMUNITY_AGENT', community: 'São Benedito' }) });

    expect(await screen.findByText('PCD-PAN-03')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Nova estação' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();
  });

  it('técnico de campo vê os botões de gerenciar estações', async () => {
    renderWithProviders(<App />, { route: '/estacoes', session: buildSession({ role: 'TECHNICIAN' }) });

    expect(await screen.findByRole('link', { name: 'Nova estação' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('a matriz é a mesma do back', () => {
    expect(can('ADMIN', 'MANAGE_USERS')).toBe(true);
    expect(can('TECHNICIAN', 'MANAGE_USERS')).toBe(false);
    expect(can('COMMUNITY_AGENT', 'MANAGE_STATIONS')).toBe(false);
    expect(can(undefined, 'VIEW_STATIONS')).toBe(false);
  });
});
