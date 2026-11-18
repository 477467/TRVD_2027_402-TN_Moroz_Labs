/** Типи відповідей API (повторюють DTO бекенду). */

export type RoleName = 'admin' | 'operator';

export interface UserDto {
  id: string;
  username: string;
  role: RoleName;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface Crime {
  id: number;
  title: string;
}

export interface Person {
  id: string;
  name: string;
  surname: string;
  fullName: string;
  dob: string;
  address: string | null;
  city: string;
  status: string;
  description: string | null;
  crimes: Crime[];
  createdAt: string;
}

export interface PersonList {
  items: Person[];
  total: number;
  page: number;
  limit: number;
}

export interface PersonQuery {
  search?: string;
  city?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/** Тіло створення / заміни особи. */
export interface PersonInput {
  name: string;
  surname: string;
  dob: string;
  address?: string;
  city: string;
  status: string;
  description?: string;
  crimeIds?: number[];
}

export interface City {
  name: string;
  region: string;
}
