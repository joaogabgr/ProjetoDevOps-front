import { api, query, type Page } from '../../api/client';
import type { Biome, Station } from '../../api/types';

export interface StationFilters {
  page?: number;
  perPage?: number;
  name?: string;
  biome?: Biome | '';
  community?: string;
  status?: 'active' | 'inactive' | '';
}

export interface StationInput {
  uuid: string;
  name: string;
  latitude: string;
  longitude: string;
  biome: Biome;
  community: string;
  timezone: string;
  communicationTimeoutMinutes: number;
  typeParameterIds: string[];
}

/** Na edição o identificador e os sensores não mudam (RF2, RF1). */
export type StationUpdate = Omit<StationInput, 'uuid' | 'typeParameterIds'>;

export const stationsApi = {
  list: (filters: StationFilters = {}) => api.get<Page<Station>>(`/stations${query({ ...filters })}`),
  get: async (id: string) => (await api.get<{ data: Station }>(`/stations/${id}`)).data,
  create: async (input: StationInput) => (await api.post<{ data: Station }>('/stations', input)).data,
  update: async (id: string, input: StationUpdate) => (await api.patch<{ data: Station }>(`/stations/${id}`, input)).data,
  setActive: async (id: string, active: boolean) =>
    (await api.patch<{ data: Station }>(`/stations/${id}/status`, { active })).data,
  remove: (id: string) => api.delete(`/stations/${id}`),
  communities: async () => (await api.get<{ data: string[] }>('/stations/communities')).data,
};
