import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { messageOf } from '../../api/client';
import type { TypeParameter } from '../../api/types';
import { useFeedback } from '../../components/Feedback';
import { ParameterForm, type ParameterFormValues } from './ParameterForm';
import { parametersApi } from './parametersApi';

export function ParameterEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const feedback = useFeedback();
  const [parameter, setParameter] = useState<TypeParameter | null>(null);
  const [error, setError] = useState('');

  // A API não tem consulta por id: a lista é curta e já vem ordenada.
  useEffect(() => {
    parametersApi.list().then(
      (items) => {
        const found = items.find((item) => item.id === id);
        if (found) setParameter(found);
        else setError('Parâmetro não encontrado.');
      },
      (caught) => setError(messageOf(caught)),
    );
  }, [id]);

  async function save(values: ParameterFormValues) {
    await parametersApi.update(id, {
      name: values.name.trim(),
      unit: values.unit.trim(),
      numberOfDecimalCases: Number(values.numberOfDecimalCases),
    });
    feedback.success('Parâmetro atualizado.');
    navigate('/parametros');
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Editar parâmetro</h1>
        <Link to="/parametros">Voltar para a lista</Link>
      </header>
      {error && (
        <p className="page-error" role="alert">
          {error}
        </p>
      )}
      {!parameter && !error && <p>Carregando…</p>}
      {parameter && (
        <ParameterForm
          mode="edit"
          initial={{
            typeJson: parameter.typeJson,
            name: parameter.name,
            unit: parameter.unit,
            numberOfDecimalCases: String(parameter.numberOfDecimalCases),
          }}
          submitLabel="Salvar alterações"
          onSubmit={save}
        />
      )}
    </section>
  );
}
