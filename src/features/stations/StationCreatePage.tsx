import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFeedback } from '../../components/Feedback';
import { SensorsField } from './SensorsField';
import { StationForm, toStationPayload, type StationFormValues } from './StationForm';
import { stationsApi } from './stationsApi';
import { useTypeParameters } from './useTypeParameters';

export function StationCreatePage() {
  const navigate = useNavigate();
  const feedback = useFeedback();
  const { typeParameters, error: typeParametersError } = useTypeParameters();
  const [typeParameterIds] = useState<string[]>([]);

  async function create(values: StationFormValues) {
    await stationsApi.create({ uuid: values.uuid.trim(), ...toStationPayload(values), typeParameterIds });
    feedback.success('Estação cadastrada.');
    navigate('/estacoes');
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Nova estação</h1>
        <Link to="/estacoes">Voltar para a lista</Link>
      </header>
      <StationForm mode="create" submitLabel="Cadastrar estação" onSubmit={create}>
        <SensorsField typeParameters={typeParameters} loadError={typeParametersError} />
      </StationForm>
    </section>
  );
}
