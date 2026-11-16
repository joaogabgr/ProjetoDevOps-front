import { api, ApiError, configureApi, fieldErrorsOf, messageOf, query } from './client';

function mockFetch(status: number, body?: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function caught(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error('a chamada deveria ter falhado');
}

describe('cliente da API', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    configureApi({ token: () => null, onUnauthorized: () => {} });
  });

  it('chama /api com JSON e devolve o corpo', async () => {
    const fetchMock = mockFetch(200, { data: [1, 2] });

    const result = await api.post<{ data: number[] }>('/stations', { name: 'X' });

    expect(result.data).toEqual([1, 2]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/stations');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"name":"X"}');
  });

  it('envia o token da sessão quando há um', async () => {
    const fetchMock = mockFetch(200, {});
    configureApi({ token: () => 'abc' });

    await api.get('/users');

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer abc');
  });

  it('transforma o erro da API em ApiError com os campos', async () => {
    mockFetch(422, {
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos na requisição.', details: [{ field: 'uuid', message: 'Obrigatório.' }] },
    });

    const error = await caught(api.post('/stations', {}));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(fieldErrorsOf(error)).toEqual({ uuid: 'Obrigatório.' });
    expect(messageOf(error)).toBe('Dados inválidos na requisição.');
  });

  it('avisa a sessão quando a API responde 401', async () => {
    mockFetch(401, { error: { code: 'UNAUTHORIZED', message: 'Sessão expirada. Entre novamente.' } });
    const onUnauthorized = vi.fn();
    configureApi({ onUnauthorized });

    await api.get('/stations').catch(() => {});

    expect(onUnauthorized).toHaveBeenCalledWith(expect.objectContaining({ message: 'Sessão expirada. Entre novamente.' }));
  });

  it('senha errada no login não derruba a sessão', async () => {
    mockFetch(401, { error: { code: 'UNAUTHORIZED', message: 'E-mail ou senha incorretos.' } });
    const onUnauthorized = vi.fn();
    configureApi({ onUnauthorized });

    await api.post('/auth/login', {}).catch(() => {});

    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('falha de rede vira mensagem clara', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const error = await caught(api.get('/stations'));

    expect(error.message).toBe('Não foi possível falar com o servidor. Verifique a conexão e tente de novo.');
  });

  it('204 devolve undefined', async () => {
    mockFetch(204);

    await expect(api.delete('/stations/1')).resolves.toBeUndefined();
  });

  it('query ignora valores vazios', () => {
    expect(query({ page: 2, name: '', biome: undefined, status: 'active' })).toBe('?page=2&status=active');
    expect(query({})).toBe('');
  });
});
