import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { messageOf } from '../../api/client';
import type { Station } from '../../api/types';
import { useFeedback } from '../../components/Feedback';
import { StationForm, toStationPayload, type StationFormValues } from './StationForm';
import { stationsApi } from './stationsApi';

function toFormValues(station: Station): StationFormValues {
  return {
    uuid: station.uuid,
    name: station.name,
    latitude: station.latitude,
    longitude: station.longitude,
    biome: station.biome,
    community: station.community,
    timezone: station.timezone,
    communicationTimeoutMinutes: String(station.communicationTimeoutMinutes),
  };
}

export function StationEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const feedback = useFeedback();
  const [station, setStation] = useState<Station | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    stationsApi.get(id).then(setStation, (caught) => setError(messageOf(caught)));
  }, [id]);

  async function save(values: StationFormValues) {
    await stationsApi.update(id, toStationPayload(values));
    feedback.success('Estação atualizada.');
    navigate('/estacoes');
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Editar estação</h1>
        <Link to="/estacoes">Voltar para a lista</Link>
      </header>
      {error && (
        <p className="page-error" role="alert">
          {error}
        </p>
      )}
      {!station && !error && <p>Carregando…</p>}
      {station && <StationForm mode="edit" initial={toFormValues(station)} submitLabel="Salvar alterações" onSubmit={save} />}
    </section>
  );
}
