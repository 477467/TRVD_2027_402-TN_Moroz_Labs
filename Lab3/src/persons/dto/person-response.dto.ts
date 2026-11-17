import { ApiProperty } from '@nestjs/swagger';

export class CrimeDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: 'ст. 190 ККУ – Шахрайство' })
  title: string;
}

/** Модель відповіді API: клієнт ніколи не бачить «сиру» сутність БД. */
export class PersonResponseDto {
  @ApiProperty({ example: 'CP-001' })
  id: string;

  @ApiProperty({ example: 'Петро' })
  name: string;

  @ApiProperty({ example: 'Іваненко' })
  surname: string;

  @ApiProperty({ example: 'Іваненко Петро', description: 'Обчислюване поле: прізвище та ім’я' })
  fullName: string;

  @ApiProperty({ example: '1990-05-14' })
  dob: string;

  @ApiProperty({ example: 'м. Київ, вул. Тестова, 1', nullable: true, type: String })
  address: string | null;

  @ApiProperty({ example: 'Київ' })
  city: string;

  @ApiProperty({ example: 'Підозрюваний' })
  status: string;

  @ApiProperty({ nullable: true, type: String })
  description: string | null;

  @ApiProperty({ type: [CrimeDto] })
  crimes: CrimeDto[];

  @ApiProperty({ example: '2027-02-10T09:30:00.000Z' })
  createdAt: string;
}

export class PersonListResponseDto {
  @ApiProperty({ type: [PersonResponseDto] })
  items: PersonResponseDto[];

  @ApiProperty({ example: 6, description: 'Загальна кількість записів за фільтром' })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
