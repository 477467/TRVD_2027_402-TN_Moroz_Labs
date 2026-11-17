import { Person } from '../entities/person.entity';
import { PersonResponseDto } from './dto/person-response.dto';

/** Перетворення сутності БД на модель API (Entity → DTO). */
export class PersonMapper {
  static toDto(person: Person): PersonResponseDto {
    return {
      id: person.id,
      name: person.name,
      surname: person.surname,
      fullName: `${person.surname} ${person.name}`,
      dob: person.dob,
      address: person.address,
      city: person.city,
      status: person.status,
      description: person.description,
      crimes: (person.crimes ?? []).map((c) => ({ id: c.id, title: c.title })),
      createdAt: person.createdAt.toISOString(),
    };
  }
}
