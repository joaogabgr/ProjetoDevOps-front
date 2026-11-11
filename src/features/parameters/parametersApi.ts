import { api } from '../../api/client';
import type { TypeParameter } from '../../api/types';

export interface ParameterInput {
  typeJson: string;
  name: string;
  unit: string;
  numberOfDecimalCases: number;
}

/** A chave não muda depois de criada (RF3 R3). */
export type ParameterUpdate = Omit<ParameterInput, 'typeJson'>;

export const parametersApi = {
  list: async () => (await api.get<{ data: TypeParameter[] }>('/type-parameters')).data,
  create: async (input: ParameterInput) => (await api.post<{ data: TypeParameter }>('/type-parameters', input)).data,
  update: async (id: string, input: ParameterUpdate) =>
    (await api.patch<{ data: TypeParameter }>(`/type-parameters/${id}`, input)).data,
  remove: (id: string) => api.delete(`/type-parameters/${id}`),
};
