import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { messageOf, type Page } from '../../api/client';
import { ROLE_LABEL, type User } from '../../api/types';
import { usersApi, type UserFilters } from './usersApi';

export function UsersListPage() {
  const [params] = useSearchParams();
  const filters: UserFilters = { page: Number(params.get('pagina') ?? 1) };
  const filtersKey = JSON.stringify(filters);
  const [result, setResult] = useState<Page<User> | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setResult(await usersApi.list(JSON.parse(filtersKey) as UserFilters));
    } catch (caught) {
      setError(messageOf(caught));
    }
  }, [filtersKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="page">
      <header className="page-header">
        <h1>Usuários</h1>
        <Link to="/usuarios/novo" className="button">
          Novo usuário
        </Link>
      </header>
      {error && (
        <p className="page-error" role="alert">
          {error}
        </p>
      )}
      {!result && !error && <p>Carregando…</p>}
      {result && result.data.length === 0 && <p>Nenhum usuário encontrado.</p>}
      {result && result.data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Comunidade</th>
                <th>Situação</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((user) => (
                <tr key={user.id}>
                  <td data-label="Nome">{user.name}</td>
                  <td data-label="E-mail">{user.email}</td>
                  <td data-label="Perfil">{ROLE_LABEL[user.role]}</td>
                  <td data-label="Comunidade">{user.community ?? '—'}</td>
                  <td data-label="Situação">
                    <span className={user.active ? 'tag tag--ok' : 'tag'}>{user.active ? 'Ativo' : 'Desativado'}</span>
                  </td>
                  <td className="table__actions">
                    <Link to={`/usuarios/${user.id}/editar`} state={{ user }}>
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
