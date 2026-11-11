import type { TypeParameter } from '../../api/types';

interface SensorsFieldProps {
  typeParameters: TypeParameter[] | null;
  loadError: string;
}

/** Sensores que a estação pode ter: os parâmetros cadastrados (RF1 R1). */
export function SensorsField({ typeParameters, loadError }: SensorsFieldProps) {
  return (
    <fieldset className="sensors">
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
              {parameter.name} ({parameter.unit})
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}
