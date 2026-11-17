import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Person } from '../entities/person.entity';
import { PersonsRepository } from './persons.repository';
import { PersonsService } from './persons.service';

describe('PersonsService', () => {
  let service: PersonsService;
  const repo = {
    findPaged: jest.fn(), findById: jest.fn(), nextId: jest.fn(), save: jest.fn(),
    remove: jest.fn(), cityExists: jest.fn(), findCrimes: jest.fn(), countDocuments: jest.fn(),
  };

  const validDto = { name: ' Роман ', surname: 'Гончар', dob: '1993-07-21', city: 'Київ', status: 'Підозрюваний' };

  beforeEach(async () => {
    jest.resetAllMocks();
    // DI: підставляємо мок репозиторію замість справжнього, БД для тестів не потрібна
    const moduleRef = await Test.createTestingModule({
      providers: [PersonsService, { provide: PersonsRepository, useValue: repo }],
    }).compile();
    service = moduleRef.get(PersonsService);
  });

  it('створює особу, видає номер і нормалізує текст', async () => {
    repo.nextId.mockResolvedValue('CP-007');
    repo.cityExists.mockResolvedValue(true);
    repo.save.mockImplementation(async (p: Person) => Object.assign(p, { createdAt: new Date('2027-01-01') }));

    const result = await service.create(validDto);

    expect(result.id).toBe('CP-007');
    expect(result.fullName).toBe('Гончар Роман');
    expect(result.crimes).toEqual([]);
  });

  it('відхиляє дату народження в майбутньому', async () => {
    repo.nextId.mockResolvedValue('CP-007');
    await expect(service.create({ ...validDto, dob: '2999-01-01' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('відхиляє місто, якого немає в довіднику', async () => {
    repo.nextId.mockResolvedValue('CP-007');
    repo.cityExists.mockResolvedValue(false);
    await expect(service.create(validDto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('повертає 404 для неіснуючої особи', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.get('CP-999')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('не дозволяє видалити особу з документами (409)', async () => {
    repo.findById.mockResolvedValue({ id: 'CP-001' });
    repo.countDocuments.mockResolvedValue(2);
    await expect(service.remove('CP-001')).rejects.toBeInstanceOf(ConflictException);
    expect(repo.remove).not.toHaveBeenCalled();
  });

  it('видаляє особу без документів', async () => {
    repo.findById.mockResolvedValue({ id: 'CP-006' });
    repo.countDocuments.mockResolvedValue(0);
    await service.remove('CP-006');
    expect(repo.remove).toHaveBeenCalledTimes(1);
  });
});
