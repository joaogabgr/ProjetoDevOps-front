import { useState, type FormEvent } from 'react';
import { fieldErrorsOf, messageOf } from '../../api/client';
import { describedBy, Field } from '../../components/Field';
import { useFeedback } from '../../components/Feedback';

export interface ParameterFormValues {
  typeJson: string;
  name: string;
  unit: string;
  numberOfDecimalCases: string;
}

export const EMPTY_PARAMETER: ParameterFormValues = { typeJson: '', name: '', unit: '', numberOfDecimalCases: '2' };

type Errors = Partial<Record<keyof ParameterFormValues, string>>;

interface ParameterFormProps {
  mode: 'create' | 'edit';
  initial?: ParameterFormValues;
  submitLabel: string;
  onSubmit(values: ParameterFormValues): Promise<void>;
}

export function ParameterForm({ mode, initial = EMPTY_PARAMETER, submitLabel, onSubmit }: ParameterFormProps) {
  const feedback = useFeedback();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof ParameterFormValues) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found: Errors = {};
    if (!values.name.trim()) found.name = 'Informe o nome do parâmetro.';
    if (!values.unit.trim()) found.unit = 'Informe a unidade.';
    const decimals = Number(values.numberOfDecimalCases);
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 6) {
      found.numberOfDecimalCases = 'Use de 0 a 6 casas decimais.';
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (caught) {
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
        <Field id="typeJson" label="Chave" error={errors.typeJson} hint="Nome do campo no JSON da placa, ex.: nivel.">
          <input id="typeJson" className="mono" value={values.typeJson} onChange={set('typeJson')} aria-describedby={describedBy('typeJson', errors.typeJson)} />
        </Field>
        <Field id="name" label="Nome" error={errors.name}>
          <input id="name" value={values.name} onChange={set('name')} aria-describedby={describedBy('name', errors.name)} />
        </Field>
        <Field id="unit" label="Unidade" error={errors.unit} hint="Ex.: mm, °C, cm.">
          <input id="unit" value={values.unit} onChange={set('unit')} aria-describedby={describedBy('unit', errors.unit)} />
        </Field>
        <Field id="numberOfDecimalCases" label="Casas decimais" error={errors.numberOfDecimalCases}>
          <input
            id="numberOfDecimalCases"
            type="number"
            min={0}
            max={6}
            value={values.numberOfDecimalCases}
            onChange={set('numberOfDecimalCases')}
            aria-describedby={describedBy('numberOfDecimalCases', errors.numberOfDecimalCases)}
          />
        </Field>
      </div>
      <div className="form__actions">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
