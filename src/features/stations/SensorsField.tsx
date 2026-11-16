import type { TypeParameter } from '../../api/types';

interface SensorsFieldProps {
  typeParameters: TypeParameter[] | null;
  loadError: string;
  selected: string[];
  onChange(selected: string[]): void;
  error?: string;
}

/** Sensores que a estação pode ter: os parâmetros cadastrados (RF1 R1). */
export function SensorsField({ typeParameters, loadError, selected, onChange, error }: SensorsFieldProps) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);

  return (
    <fieldset className={error ? 'sensors sensors--invalid' : 'sensors'} aria-describedby={error ? 'sensors-error' : undefined}>
      <legend>Sensores instalados</legend>
      {loadError && (
        <p className="field__error" role="alert">
          {loadError}
        </p>
      )}
      {!typeParameters && !loadError && <p>Carregando parâmetros…</p>}
      {typeParameters && (
        <ul className="sensors__list">
          {typeParameters.map((parameter) => (
            <li key={parameter.id}>
              <label className="sensors__option">
                <input type="checkbox" checked={selected.includes(parameter.id)} onChange={() => toggle(parameter.id)} />
                {parameter.name} ({parameter.unit})
              </label>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="field__error" id="sensors-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
