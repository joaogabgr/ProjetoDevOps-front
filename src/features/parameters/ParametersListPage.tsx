import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messageOf } from '../../api/client';
import { useFeedback } from '../../components/Feedback';
import type { TypeParameter } from '../../api/types';
import { parametersApi } from './parametersApi';

export function ParametersListPage() {
  const [items, setItems] = useState<TypeParameter[] | null>(null);
  const [error, setError] = useState('');
  const feedback = useFeedback();

  const load = useCallback(async () => {
    setError('');
    try {
      setItems(await parametersApi.list());
    } catch (caught) {
      setError(messageOf(caught));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(parameter: TypeParameter) {
    try {
      await parametersApi.remove(parameter.id);
      feedback.success('Parâmetro excluído.');
      await load();
    } catch (caught) {
      feedback.error(messageOf(caught));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Parâmetros</h1>
        <Link to="/parametros/novo" className="button">
          Novo parâmetro
        </Link>
      </header>
      {error && (
        <p className="page-error" role="alert">
          {error}
        </p>
      )}
      {!items && !error && <p>Carregando…</p>}
      {items && items.length === 0 && <p>Nenhum parâmetro cadastrado.</p>}
      {items && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Chave</th>
                <th>Nome</th>
                <th>Unidade</th>
                <th>Casas decimais</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((parameter) => (
                <tr key={parameter.id}>
                  <td data-label="Chave" className="mono">
                    {parameter.typeJson}
                  </td>
                  <td data-label="Nome">{parameter.name}</td>
                  <td data-label="Unidade">{parameter.unit}</td>
                  <td data-label="Casas decimais">{parameter.numberOfDecimalCases}</td>
                  <td className="table__actions">
                    <Link to={`/parametros/${parameter.id}/editar`}>Editar</Link>
                    <button type="button" className="link-button link-button--danger" onClick={() => remove(parameter)}>
                      Excluir
                    </button>
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
