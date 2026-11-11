import { useEffect, useState } from 'react';
import { api, messageOf } from '../../api/client';
import type { TypeParameter } from '../../api/types';

/** Parâmetros cadastrados (RF3), para escolher os sensores da estação (RF1). */
export function useTypeParameters() {
  const [typeParameters, setTypeParameters] = useState<TypeParameter[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get<{ data: TypeParameter[] }>('/type-parameters')
      .then((response) => active && setTypeParameters(response.data))
      .catch((caught) => active && setError(messageOf(caught)));
    return () => {
      active = false;
    };
  }, []);

  return { typeParameters, error };
}
