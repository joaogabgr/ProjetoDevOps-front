import { useState, type FormEvent } from 'react';
import { fieldErrorsOf, messageOf } from '../../api/client';
import { ROLE_LABEL, type Role } from '../../api/types';
import { describedBy, Field } from '../../components/Field';
import { useFeedback } from '../../components/Feedback';

export interface UserFormValues {
  name: string;
  email: string;
  cpf: string;
  password: string;
  role: Role;
  community: string;
}

export const EMPTY_USER: UserFormValues = { name: '', email: '', cpf: '', password: '', role: 'TECHNICIAN', community: '' };

type Errors = Partial<Record<keyof UserFormValues, string>>;

interface UserFormProps {
  mode: 'create' | 'edit';
  initial?: UserFormValues;
  submitLabel: string;
  onSubmit(values: UserFormValues): Promise<void>;
}

export function UserForm({ mode, initial = EMPTY_USER, submitLabel, onSubmit }: UserFormProps) {
  const feedback = useFeedback();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof UserFormValues) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found: Errors = {};
    if (values.name.trim().length < 3) found.name = 'O nome deve ter ao menos 3 caracteres.';
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
        <Field id="name" label="Nome" error={errors.name}>
          <input id="name" value={values.name} onChange={set('name')} aria-describedby={describedBy('name', errors.name)} />
        </Field>
        <Field id="email" label="E-mail" error={errors.email}>
          <input id="email" type="email" value={values.email} onChange={set('email')} aria-describedby={describedBy('email', errors.email)} />
        </Field>
        {mode === 'create' && (
          <>
            <Field id="cpf" label="CPF" error={errors.cpf}>
              <input id="cpf" inputMode="numeric" value={values.cpf} onChange={set('cpf')} aria-describedby={describedBy('cpf', errors.cpf)} />
            </Field>
            <Field id="password" label="Senha" error={errors.password} hint="De 8 a 72 caracteres.">
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={values.password}
                onChange={set('password')}
                aria-describedby={describedBy('password', errors.password)}
              />
            </Field>
          </>
        )}
        <Field id="role" label="Perfil" error={errors.role}>
          <select id="role" value={values.role} onChange={set('role')}>
            {Object.entries(ROLE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="community" label="Comunidade" error={errors.community}>
          <input id="community" value={values.community} onChange={set('community')} aria-describedby={describedBy('community', errors.community)} />
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

/** Só o Agente comunitário tem comunidade (RF5 R2). */
export function communityFor(values: UserFormValues): string | null {
  return values.role === 'COMMUNITY_AGENT' ? values.community.trim() || null : null;
}
