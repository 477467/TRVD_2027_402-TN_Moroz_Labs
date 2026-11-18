import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { City } from '../entities/city.entity';
import { Crime } from '../entities/crime.entity';
import { OfficialDocument } from '../entities/official-document.entity';
import { Person } from '../entities/person.entity';

export interface PersonsFilter {
  search?: string;
  city?: string;
  status?: string;
  page: number;
  limit: number;
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, '\\$&');

/**
 * Патерн Repository: уся робота з БД для сутності Person зосереджена тут.
 * Сервісний шар не знає, що під капотом TypeORM і PostgreSQL.
 */
@Injectable()
export class PersonsRepository {
  constructor(@InjectRepository(Person) private readonly repo: Repository<Person>) {}

  async findPaged(filter: PersonsFilter): Promise<[Person[], number]> {
    const qb = this.repo.createQueryBuilder('p').leftJoinAndSelect('p.crimes', 'c');

    if (filter.city) qb.andWhere('p.city = :city', { city: filter.city });
    if (filter.status) qb.andWhere('p.status = :status', { status: filter.status });
    if (filter.search) {
      const like = `%${escapeLike(filter.search.trim())}%`;
      qb.andWhere(
        new Brackets((w) =>
          w
            .where('p.id ILIKE :like')
            .orWhere('p.name ILIKE :like')
            .orWhere('p.surname ILIKE :like')
            .orWhere('p.dob ILIKE :like')
            .orWhere('p.address ILIKE :like')
            .orWhere('p.city ILIKE :like')
            .orWhere('p.description ILIKE :like')
            .orWhere(
              `EXISTS (SELECT 1 FROM person_crimes pc JOIN crimes cr ON cr.id = pc.crime_id
                       WHERE pc.person_id = p.id AND cr.title ILIKE :like)`,
            ),
        ),
        { like },
      );
    }

    return qb
      .orderBy('p.id', 'ASC')
      .skip((filter.page - 1) * filter.limit)
      .take(filter.limit)
      .getManyAndCount();
  }

  findById(id: string): Promise<Person | null> {
    return this.repo.findOne({ where: { id } });
  }

  /** Наступний обліковий номер у форматі CP-NNN. */
  async nextId(): Promise<string> {
    const rows: Array<{ next: string }> = await this.repo.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 4) AS INTEGER)), 0) + 1 AS next FROM persons`,
    );
    return `CP-${String(rows[0].next).padStart(3, '0')}`;
  }

  save(person: Person): Promise<Person> {
    return this.repo.save(person);
  }

  async remove(person: Person): Promise<void> {
    await this.repo.remove(person);
  }

  cityExists(name: string): Promise<boolean> {
    return this.repo.manager.existsBy(City, { name });
  }

  findCrimes(ids: number[]): Promise<Crime[]> {
    return ids.length ? this.repo.manager.findBy(Crime, { id: In(ids) }) : Promise.resolve([]);
  }

  countDocuments(personId: string): Promise<number> {
    return this.repo.manager.countBy(OfficialDocument, { personId });
  }
}
