import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../../components/filters.css';
import { messageOf, type Page } from '../../api/client';
import { ROLE_LABEL, type Role, type User } from '../../api/types';
import { Pagination } from '../../components/Pagination';
import { useFeedback } from '../../components/Feedback';
import { usersApi, type UserFilters } from './usersApi';

export function UsersListPage() {
  const [params, setParams] = useSearchParams();
  const filters: UserFilters = {
    page: Number(params.get('pagina') ?? 1),
    name: params.get('nome') ?? '',
    role: (params.get('perfil') ?? '') as Role | '',
    community: params.get('comunidade') ?? '',
  };

  function setParam(key: string, value: string, resetPage = true) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (resetPage) next.delete('pagina');
    setParams(next);
  }
  const filtersKey = JSON.stringify(filters);
  const [result, setResult] = useState<Page<User> | null>(null);
  const [error, setError] = useState('');
  const feedback = useFeedback();

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

  async function toggleActive(user: User) {
    try {
      await usersApi.update(user.id, { active: !user.active });
      feedback.success(user.active ? 'Usuário desativado.' : 'Usuário reativado.');
      await load();
    } catch (caught) {
      feedback.error(messageOf(caught));
    }
  }

  async function remove(user: User) {
    try {
      await usersApi.remove(user.id);
      feedback.success('Usuário excluído.');
      await load();
    } catch (caught) {
      feedback.error(messageOf(caught));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Usuários</h1>
        <Link to="/usuarios/novo" className="button">
          Novo usuário
        </Link>
      </header>
      <form className="filters" role="search" onSubmit={(event) => event.preventDefault()}>
        <label>
          Nome
          <input value={filters.name} onChange={(event) => setParam('nome', event.target.value)} />
        </label>
        <label>
          Perfil
          <select value={filters.role} onChange={(event) => setParam('perfil', event.target.value)}>
            <option value="">Todos</option>
            {Object.entries(ROLE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Comunidade
          <input value={filters.community} onChange={(event) => setParam('comunidade', event.target.value)} />
        </label>
      </form>

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
                    <button type="button" className="link-button" onClick={() => toggleActive(user)}>
                      {user.active ? 'Desativar' : 'Reativar'}
                    </button>
                    <button type="button" className="link-button link-button--danger" onClick={() => remove(user)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {result && (
        <Pagination
          page={result.meta.page}
          totalPages={result.meta.totalPages}
          total={result.meta.total}
          onChange={(next) => setParam('pagina', String(next), false)}
        />
      )}
    </section>
  );
}
