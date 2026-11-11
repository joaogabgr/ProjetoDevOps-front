import { api, query, type Page } from '../../api/client';
import type { Role, User } from '../../api/types';

export interface UserFilters {
  page?: number;
  perPage?: number;
  name?: string;
  role?: Role | '';
  community?: string;
}

export interface UserInput {
  name: string;
  email: string;
  cpf: string;
  password: string;
  role: Role;
  community: string | null;
}

/** CPF e senha não são editados por aqui (RF5). */
export interface UserUpdate {
  name?: string;
  email?: string;
  role?: Role;
  community?: string | null;
  active?: boolean;
}

export const usersApi = {
  list: (filters: UserFilters = {}) => api.get<Page<User>>(`/users${query({ ...filters })}`),
  create: async (input: UserInput) => (await api.post<{ data: User }>('/users', input)).data,
  update: async (id: string, input: UserUpdate) => (await api.patch<{ data: User }>(`/users/${id}`, input)).data,
  remove: (id: string) => api.delete(`/users/${id}`),
};
