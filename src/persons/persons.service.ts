import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Person } from '../entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { PersonListResponseDto, PersonResponseDto } from './dto/person-response.dto';
import { QueryPersonsDto } from './dto/query-persons.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { MIN_AGE_YEARS } from './persons.constants';
import { PersonMapper } from './person.mapper';
import { PersonsRepository } from './persons.repository';

/** Поля, які сервіс уміє застосовувати до сутності (null дозволяє очистити необов’язкове поле). */
interface PersonPatch {
  name?: string;
  surname?: string;
  dob?: string;
  address?: string | null;
  city?: string;
  status?: string;
  description?: string | null;
  crimeIds?: number[];
}

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');

/**
 * Сервісний шар: уся бізнес-логіка тут. Контролер лише передає дані сюди.
 * Залежність PersonsRepository надає контейнер DI (NestJS).
 */
@Injectable()
export class PersonsService {
  constructor(private readonly repo: PersonsRepository) {}

  async list(query: QueryPersonsDto): Promise<PersonListResponseDto> {
    const [persons, total] = await this.repo.findPaged(query);
    return { items: persons.map(PersonMapper.toDto), total, page: query.page, limit: query.limit };
  }

  async get(id: string): Promise<PersonResponseDto> {
    return PersonMapper.toDto(await this.findOrFail(id));
  }

  async create(dto: CreatePersonDto): Promise<PersonResponseDto> {
    const person = new Person();
    person.id = await this.repo.nextId(); // бізнес-правило: номер видає система
    person.address = null;
    person.description = null;
    person.crimes = [];
    await this.apply(person, dto);
    return PersonMapper.toDto(await this.repo.save(person));
  }

  /** PUT: повна заміна, тому необов’язкові поля, яких немає в запиті, очищаються. */
  async replace(id: string, dto: CreatePersonDto): Promise<PersonResponseDto> {
    const person = await this.findOrFail(id);
    await this.apply(person, { address: null, description: null, crimeIds: [], ...dto });
    return PersonMapper.toDto(await this.repo.save(person));
  }

  /** PATCH: змінюються лише передані поля. */
  async update(id: string, dto: UpdatePersonDto): Promise<PersonResponseDto> {
    const person = await this.findOrFail(id);
    await this.apply(person, dto);
    return PersonMapper.toDto(await this.repo.save(person));
  }

  async remove(id: string): Promise<void> {
    const person = await this.findOrFail(id);
    // бізнес-правило: не можна видаляти особу, до якої прив’язані службові документи
    const documents = await this.repo.countDocuments(id);
    if (documents > 0) {
      throw new ConflictException(
        `Неможливо видалити запис ${id}: до нього прив’язано службових документів – ${documents}`,
      );
    }
    await this.repo.remove(person);
  }

  // ---------- приватні допоміжні методи ----------

  private async findOrFail(id: string): Promise<Person> {
    const person = await this.repo.findById(id);
    if (!person) throw new NotFoundException(`Особу з номером ${id} не знайдено`);
    return person;
  }

  private async apply(person: Person, patch: PersonPatch): Promise<void> {
    if (patch.name !== undefined) person.name = normalize(patch.name);
    if (patch.surname !== undefined) person.surname = normalize(patch.surname);
    if (patch.status !== undefined) person.status = patch.status;
    if (patch.address !== undefined) person.address = patch.address === null ? null : normalize(patch.address);
    if (patch.description !== undefined) {
      person.description = patch.description === null ? null : patch.description.trim();
    }
    if (patch.dob !== undefined) {
      this.assertValidBirthDate(patch.dob);
      person.dob = patch.dob;
    }
    if (patch.city !== undefined) {
      const city = normalize(patch.city);
      if (!(await this.repo.cityExists(city))) {
        throw new BadRequestException(`Місто «${city}» відсутнє в довіднику міст`);
      }
      person.city = city;
    }
    if (patch.crimeIds !== undefined) person.crimes = await this.resolveCrimes(patch.crimeIds);
  }

  private assertValidBirthDate(value: string): void {
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      throw new BadRequestException(`Дата народження «${value}» не існує в календарі`);
    }
    const now = new Date();
    if (date > now) throw new BadRequestException('Дата народження не може бути в майбутньому');
    const minBirth = new Date(Date.UTC(now.getUTCFullYear() - MIN_AGE_YEARS, now.getUTCMonth(), now.getUTCDate()));
    if (date > minBirth) throw new BadRequestException(`Мінімальний вік особи – ${MIN_AGE_YEARS} років`);
  }

  private async resolveCrimes(ids: number[]) {
    const crimes = await this.repo.findCrimes(ids);
    if (crimes.length !== ids.length) {
      const found = new Set(crimes.map((c) => c.id));
      const missing = ids.filter((id) => !found.has(id));
      throw new BadRequestException(`Кваліфікацій з id ${missing.join(', ')} немає в довіднику`);
    }
    return crimes;
  }
}
