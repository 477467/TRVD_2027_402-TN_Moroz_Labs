import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../entities/city.entity';
import { Crime } from '../entities/crime.entity';
import { CityDto, CrimeRefDto } from './dto/reference.dto';

/** Довідники для форм клієнта: міста та кваліфікації правопорушень. */
@Injectable()
export class ReferenceService {
  constructor(
    @InjectRepository(City) private readonly cities: Repository<City>,
    @InjectRepository(Crime) private readonly crimes: Repository<Crime>,
  ) {}

  async listCities(): Promise<CityDto[]> {
    const rows = await this.cities.find({ order: { name: 'ASC' } });
    return rows.map((c) => ({ name: c.name, region: c.region }));
  }

  async listCrimes(): Promise<CrimeRefDto[]> {
    const rows = await this.crimes.find({ order: { id: 'ASC' } });
    return rows.map((c) => ({ id: c.id, title: c.title }));
  }
}
