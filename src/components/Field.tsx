import type { ReactNode } from 'react';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/**
 * Rótulo, campo e mensagem de erro ao lado do campo (RNF1 R3).
 *
 * O campo filho deve usar o mesmo `id` e `aria-describedby={describedBy(id)}`.
 */
export function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className={error ? 'field field--invalid' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, error?: string): string {
  return error ? `${id}-error` : `${id}-hint`;
}
