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
  const [typeParameterIds, setTypeParameterIds] = useState<string[]>([]);
  const [sensorsError, setSensorsError] = useState('');

  async function create(values: StationFormValues) {
    if (typeParameterIds.length === 0) {
      setSensorsError('A estação precisa de ao menos um parâmetro.');
      return;
    }
    setSensorsError('');
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
        <SensorsField
          typeParameters={typeParameters}
          loadError={typeParametersError}
          selected={typeParameterIds}
          onChange={setTypeParameterIds}
          error={sensorsError}
        />
      </StationForm>
    </section>
  );
}
