import { Person, PersonInput, PersonList, PersonQuery } from '../../types/api';
import { httpClient } from './httpClient';

/** CRUD осіб. Порожні параметри пошуку не передаються до API. */
export const PersonsService = {
  async list(query: PersonQuery = {}): Promise<PersonList> {
    const params = Object.fromEntries(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== ''),
    );
    const { data } = await httpClient.get<PersonList>('/persons', { params });
    return data;
  },

  async get(id: string): Promise<Person> {
    const { data } = await httpClient.get<Person>(`/persons/${encodeURIComponent(id)}`);
    return data;
  },

  async create(input: PersonInput): Promise<Person> {
    const { data } = await httpClient.post<Person>('/persons', input);
    return data;
  },

  /** PUT: повна заміна запису (форма редагування завжди надсилає всі поля). */
  async replace(id: string, input: PersonInput): Promise<Person> {
    const { data } = await httpClient.put<Person>(`/persons/${encodeURIComponent(id)}`, input);
    return data;
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/persons/${encodeURIComponent(id)}`);
  },
};
