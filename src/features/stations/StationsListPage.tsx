import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { messageOf, type Page } from '../../api/client';
import { Can } from '../../auth/Can';
import { useFeedback } from '../../components/Feedback';
import { Pagination } from '../../components/Pagination';
import { BIOME_LABEL, type Station } from '../../api/types';
import { stationsApi, type StationFilters } from './stationsApi';

export function StationsListPage() {
  const [params, setParams] = useSearchParams();
  const filters: StationFilters = { page: Number(params.get('pagina') ?? 1) };
  const filtersKey = JSON.stringify(filters);
  const [result, setResult] = useState<Page<Station> | null>(null);
  const [error, setError] = useState('');
  const feedback = useFeedback();

  const load = useCallback(async () => {
    setError('');
    try {
      setResult(await stationsApi.list(JSON.parse(filtersKey) as StationFilters));
    } catch (caught) {
      setError(messageOf(caught));
    }
  }, [filtersKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleActive(station: Station) {
    try {
      await stationsApi.setActive(station.id, !station.active);
      feedback.success(station.active ? 'Estação desativada.' : 'Estação reativada.');
      await load();
    } catch (caught) {
      feedback.error(messageOf(caught));
    }
  }

  async function remove(station: Station) {
    try {
      await stationsApi.remove(station.id);
      feedback.success('Estação excluída.');
      await load();
    } catch (caught) {
      feedback.error(messageOf(caught));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Estações</h1>
        <Can permission="MANAGE_STATIONS">
          <Link to="/estacoes/nova" className="button">
            Nova estação
          </Link>
        </Can>
      </header>

      {error && (
        <p className="page-error" role="alert">
          {error}
        </p>
      )}
      {!result && !error && <p>Carregando…</p>}
      {result && result.data.length === 0 && <p>Nenhuma estação encontrada.</p>}
      {result && result.data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Nome</th>
                <th>Bioma</th>
                <th>Comunidade</th>
                <th>Situação</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((station) => (
                <tr key={station.id}>
                  <td data-label="Identificador" className="mono">
                    {station.uuid}
                  </td>
                  <td data-label="Nome">{station.name}</td>
                  <td data-label="Bioma">{BIOME_LABEL[station.biome]}</td>
                  <td data-label="Comunidade">{station.community}</td>
                  <td data-label="Situação">
                    <span className={station.active ? 'tag tag--ok' : 'tag'}>{station.active ? 'Ativa' : 'Desativada'}</span>
                  </td>
                  <td className="table__actions">
                    <Can permission="MANAGE_STATIONS">
                    <Link to={`/estacoes/${station.id}/editar`}>Editar</Link>
                    <button type="button" className="link-button" onClick={() => toggleActive(station)}>
                      {station.active ? 'Desativar' : 'Reativar'}
                    </button>
                    <button type="button" className="link-button link-button--danger" onClick={() => remove(station)}>
                      Excluir
                    </button>
                    </Can>
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
          onChange={(next) => {
            const nextParams = new URLSearchParams(params);
            nextParams.set('pagina', String(next));
            setParams(nextParams);
          }}
        />
      )}
    </section>
  );
}
