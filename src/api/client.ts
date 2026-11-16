/** Erro de campo devolvido pela API (422 e 409), para mostrar ao lado do campo. */
export interface FieldError {
  field: string;
  message: string;
}

/** Qualquer resposta de erro da API, já com a mensagem pronta para a tela. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: FieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface Page<T> {
  data: T[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
}

type TokenProvider = () => string | null;

let tokenProvider: TokenProvider = () => null;
let onUnauthorized: (error: ApiError) => void = () => {};

/** Evento disparado quando a API recusa a leitura de uma tela por perfil (403). */
export const FORBIDDEN_EVENT = 'vigia:acesso-negado';

/** Liga o cliente à sessão: de onde vem o token e o que fazer quando a API responde 401. */
export function configureApi(options: { token?: TokenProvider; onUnauthorized?: (error: ApiError) => void }) {
  if (options.token) tokenProvider = options.token;
  if (options.onUnauthorized) onUnauthorized = options.onUnauthorized;
}

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const NETWORK_ERROR = 'Não foi possível falar com o servidor. Verifique a conexão e tente de novo.';
const UNEXPECTED_ERROR = 'Algo deu errado. Tente de novo em instantes.';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenProvider();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_ERROR);
  }

  if (response.status === 204) return undefined as T;

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new ApiError(
      response.status,
      json?.error?.code ?? `HTTP_${response.status}`,
      json?.error?.message ?? UNEXPECTED_ERROR,
      json?.error?.details ?? [],
    );
    // O login devolve 401 para senha errada; só a sessão vencida deve derrubar o usuário.
    if (response.status === 401 && path !== '/auth/login') onUnauthorized(error);
    if (response.status === 403 && method === 'GET') window.dispatchEvent(new CustomEvent(FORBIDDEN_EVENT));
    throw error;
  }

  return json as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: (path: string) => request<void>('DELETE', path),
};

/** Monta a query string ignorando valores vazios: `{ page: 2, name: '' }` vira `?page=2`. */
export function query(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

/** Erros de campo como `{ campo: mensagem }`, para o formulário mostrar ao lado de cada um. */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(error.details.map((detail) => [detail.field, detail.message]));
}

/** Mensagem para mostrar ao usuário a partir de qualquer erro. */
export function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.message : UNEXPECTED_ERROR;
}
