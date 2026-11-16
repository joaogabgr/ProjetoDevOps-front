import type { Station, TypeParameter, User } from '../api/types';
import type { Session } from '../auth/session';

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u-1',
    name: 'Ana Técnica',
    email: 'ana@vigia.org',
    cpf: '52998224725',
    role: 'ADMIN',
    community: null,
    active: true,
    createdAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  };
}

export function buildSession(user: Partial<User> = {}, hoursLeft = 8): Session {
  return {
    token: 'token-de-teste',
    expiresAt: new Date(Date.now() + hoursLeft * 3_600_000).toISOString(),
    user: buildUser(user),
  };
}

export function buildStation(overrides: Partial<Station> = {}): Station {
  return {
    id: 's-1',
    uuid: 'PCD-PAN-03',
    name: 'Rio Miranda – São Benedito',
    latitude: '-20.2418',
    longitude: '-56.3792',
    biome: 'PANTANAL',
    community: 'São Benedito',
    timezone: 'America/Campo_Grande',
    communicationTimeoutMinutes: 60,
    active: true,
    createdAt: '2026-10-01T12:00:00.000Z',
    dateLastMeasure: null,
    parameters: [],
    ...overrides,
  };
}

export function buildTypeParameter(overrides: Partial<TypeParameter> = {}): TypeParameter {
  return {
    id: '7',
    typeJson: 'nivel',
    name: 'Nível do Rio',
    unit: 'cm',
    numberOfDecimalCases: 1,
    factor: 1,
    offset: 0,
    ...overrides,
  };
}
