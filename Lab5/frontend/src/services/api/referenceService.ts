import { City, Crime } from '../../types/api';
import { httpClient } from './httpClient';

export const ReferenceService = {
  async cities(): Promise<City[]> {
    const { data } = await httpClient.get<City[]>('/cities');
    return data;
  },

  async crimes(): Promise<Crime[]> {
    const { data } = await httpClient.get<Crime[]>('/crimes');
    return data;
  },
};
