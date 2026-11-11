import { useState, type FormEvent, type ReactNode } from 'react';
import { fieldErrorsOf, messageOf } from '../../api/client';
import { BIOME_LABEL, type Biome } from '../../api/types';
import { describedBy, Field } from '../../components/Field';
import { useFeedback } from '../../components/Feedback';

export interface StationFormValues {
  uuid: string;
  name: string;
  latitude: string;
  longitude: string;
  biome: Biome;
  community: string;
  timezone: string;
  communicationTimeoutMinutes: string;
}

export const EMPTY_STATION: StationFormValues = {
  uuid: '',
  name: '',
  latitude: '',
  longitude: '',
  biome: 'PANTANAL',
  community: '',
  timezone: 'America/Campo_Grande',
  communicationTimeoutMinutes: '60',
};

/** Fusos das regiões onde a ONG tem estações (RF2). */
export const TIMEZONES = [
  { value: 'America/Campo_Grande', label: 'Mato Grosso do Sul (America/Campo_Grande)' },
  { value: 'America/Cuiaba', label: 'Mato Grosso (America/Cuiaba)' },
  { value: 'America/Sao_Paulo', label: 'Brasília (America/Sao_Paulo)' },
  { value: 'America/Belem', label: 'Pará (America/Belem)' },
  { value: 'America/Manaus', label: 'Amazonas (America/Manaus)' },
  { value: 'America/Porto_Velho', label: 'Rondônia (America/Porto_Velho)' },
];

type Errors = Partial<Record<keyof StationFormValues | 'typeParameterIds', string>>;

/** Regras do RF2 conferidas antes de enviar; a API confere de novo. */
export function validateStation(values: StationFormValues): Errors {
  const errors: Errors = {};
  if (!values.uuid.trim()) errors.uuid = 'Informe o identificador gravado na placa.';
  if (values.name.trim().length < 3) errors.name = 'O nome deve ter ao menos 3 caracteres.';
  const latitude = Number(values.latitude);
  if (values.latitude.trim() === '' || Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = 'Latitude deve ser um número entre -90 e 90.';
  }
  const longitude = Number(values.longitude);
  if (values.longitude.trim() === '' || Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    errors.longitude = 'Longitude deve ser um número entre -180 e 180.';
  }
  if (values.community.trim().length < 2) errors.community = 'Informe a comunidade.';
  const timeout = Number(values.communicationTimeoutMinutes);
  if (!Number.isInteger(timeout) || timeout < 15 || timeout > 1440) {
    errors.communicationTimeoutMinutes = 'O tempo limite deve ficar entre 15 e 1440 minutos.';
  }
  return errors;
}

interface StationFormProps {
  mode: 'create' | 'edit';
  initial?: StationFormValues;
  submitLabel: string;
  onSubmit(values: StationFormValues): Promise<void>;
  /** Parte extra do formulário (ex.: sensores instalados). */
  children?: ReactNode;
}

export function StationForm({ mode, initial = EMPTY_STATION, submitLabel, onSubmit, children }: StationFormProps) {
  const feedback = useFeedback();
  const [values, setValues] = useState<StationFormValues>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof StationFormValues) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = validateStation(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (caught) {
      // Erros de campo da API (409/422) aparecem ao lado do campo (RNF1 R3).
      const fromApi = fieldErrorsOf(caught) as Errors;
      if (Object.keys(fromApi).length > 0) {
        setErrors(fromApi);
      } else {
        feedback.error(messageOf(caught));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate data-mode={mode}>
      <div className="form__grid">
        <Field id="uuid" label="Identificador da placa" error={errors.uuid} hint="Ex.: PCD-PAN-03. Não muda depois de criado.">
          <input id="uuid" value={values.uuid} onChange={set('uuid')} aria-describedby={describedBy('uuid', errors.uuid)} />
        </Field>
        <Field id="name" label="Nome" error={errors.name}>
          <input id="name" value={values.name} onChange={set('name')} aria-describedby={describedBy('name', errors.name)} />
        </Field>
        <Field id="latitude" label="Latitude" error={errors.latitude}>
          <input id="latitude" inputMode="decimal" value={values.latitude} onChange={set('latitude')} aria-describedby={describedBy('latitude', errors.latitude)} />
        </Field>
        <Field id="longitude" label="Longitude" error={errors.longitude}>
          <input id="longitude" inputMode="decimal" value={values.longitude} onChange={set('longitude')} aria-describedby={describedBy('longitude', errors.longitude)} />
        </Field>
        <Field id="biome" label="Bioma" error={errors.biome}>
          <select id="biome" value={values.biome} onChange={set('biome')}>
            {Object.entries(BIOME_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="community" label="Comunidade" error={errors.community}>
          <input id="community" value={values.community} onChange={set('community')} aria-describedby={describedBy('community', errors.community)} />
        </Field>
        <Field id="timezone" label="Fuso horário" error={errors.timezone}>
          <select id="timezone" value={values.timezone} onChange={set('timezone')}>
            {TIMEZONES.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          id="communicationTimeoutMinutes"
          label="Tempo limite sem comunicação (minutos)"
          error={errors.communicationTimeoutMinutes}
          hint="De 15 a 1440. Depois disso a estação fica sem comunicação."
        >
          <input
            id="communicationTimeoutMinutes"
            type="number"
            min={15}
            max={1440}
            value={values.communicationTimeoutMinutes}
            onChange={set('communicationTimeoutMinutes')}
            aria-describedby={describedBy('communicationTimeoutMinutes', errors.communicationTimeoutMinutes)}
          />
        </Field>
      </div>
      {children}
      <div className="form__actions">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function toStationPayload(values: StationFormValues) {
  return {
    name: values.name.trim(),
    latitude: values.latitude.trim(),
    longitude: values.longitude.trim(),
    biome: values.biome,
    community: values.community.trim(),
    timezone: values.timezone,
    communicationTimeoutMinutes: Number(values.communicationTimeoutMinutes),
  };
}
