import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { messageOf, type Page } from '../../api/client';
import { BIOME_LABEL, type Station } from '../../api/types';
import { stationsApi, type StationFilters } from './stationsApi';

export function StationsListPage() {
  const [params] = useSearchParams();
  const filters: StationFilters = { page: Number(params.get('pagina') ?? 1) };
  const filtersKey = JSON.stringify(filters);
  const [result, setResult] = useState<Page<Station> | null>(null);
  const [error, setError] = useState('');

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

  return (
    <section className="page">
      <header className="page-header">
        <h1>Estações</h1>
        <Link to="/estacoes/nova" className="button">
          Nova estação
        </Link>
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
                    <Link to={`/estacoes/${station.id}/editar`}>Editar</Link>
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
