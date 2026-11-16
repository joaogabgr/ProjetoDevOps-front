export type Role = 'ADMIN' | 'TECHNICIAN' | 'COMMUNITY_AGENT';

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador',
  TECHNICIAN: 'Técnico de campo',
  COMMUNITY_AGENT: 'Agente comunitário',
};

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: Role;
  community: string | null;
  active: boolean;
  createdAt: string;
}

export type Biome = 'PANTANAL' | 'CERRADO' | 'AMAZONIA';

export const BIOME_LABEL: Record<Biome, string> = {
  PANTANAL: 'Pantanal',
  CERRADO: 'Cerrado',
  AMAZONIA: 'Amazônia',
};

export interface StationParameter {
  id: string;
  typeParameterId: string;
  name?: string;
  unit?: string;
}

export interface Station {
  id: string;
  uuid: string;
  name: string;
  latitude: string;
  longitude: string;
  biome: Biome;
  community: string;
  timezone: string;
  communicationTimeoutMinutes: number;
  active: boolean;
  createdAt: string;
  dateLastMeasure: number | null;
  parameters?: StationParameter[];
}

export interface TypeParameter {
  id: string;
  typeJson: string;
  name: string;
  unit: string;
  numberOfDecimalCases: number;
  factor: number;
  offset: number;
}
