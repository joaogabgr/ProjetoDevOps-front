import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { api } from '../api/client';
import { buildSession } from '../test/fixtures';
import { AuthProvider, useAuth } from './AuthContext';
import { loadSession, saveSession } from './session';

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('sessão (SCRUM-213 — RF9)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('o login guarda a sessão e as próximas chamadas levam o token', async () => {
    const session = buildSession({ name: 'Ana' });
    const fetchMock = mockFetch({ data: session });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.login('ana@vigia.org', 'senha-certa'));

    expect(result.current.user?.name).toBe('Ana');
    expect(loadSession()?.token).toBe('token-de-teste');
    await api.get('/stations').catch(() => {});
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer token-de-teste');
  });

  it('senha errada não cria sessão', async () => {
    mockFetch({ error: { code: 'UNAUTHORIZED', message: 'E-mail ou senha incorretos.' } }, 401);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(act(() => result.current.login('ana@vigia.org', 'errada'))).rejects.toThrow('E-mail ou senha incorretos.');
    expect(result.current.session).toBeNull();
  });

  it('abre já logado quando há sessão válida no navegador', () => {
    saveSession(buildSession({ name: 'Bruno' }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user?.name).toBe('Bruno');
  });

  it('descarta sessão vencida guardada no navegador', () => {
    saveSession(buildSession({}, -1));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.session).toBeNull();
    expect(loadSession()).toBeNull();
  });

  it('logout apaga a sessão', () => {
    saveSession(buildSession());
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.logout());

    expect(result.current.session).toBeNull();
    expect(loadSession()).toBeNull();
  });
});
