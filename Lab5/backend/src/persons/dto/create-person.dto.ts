import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize, ArrayUnique, IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength,
} from 'class-validator';
import { PERSON_STATUSES } from '../persons.constants';

/** Вхідні дані для створення (і повної заміни) облікового запису особи. */
export class CreatePersonDto {
  @ApiProperty({ example: 'Роман', description: 'Ім’я особи' })
  @MaxLength(100, { message: 'Ім’я не може бути довшим за 100 символів' })
  @IsString({ message: 'Ім’я має бути рядком' })
  @IsNotEmpty({ message: 'Ім’я є обов’язковим' })
  name: string;

  @ApiProperty({ example: 'Гончар', description: 'Прізвище особи' })
  @MaxLength(100, { message: 'Прізвище не може бути довшим за 100 символів' })
  @IsString({ message: 'Прізвище має бути рядком' })
  @IsNotEmpty({ message: 'Прізвище є обов’язковим' })
  surname: string;

  @ApiProperty({ example: '1993-07-21', description: 'Дата народження у форматі РРРР-ММ-ДД' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Дата народження має бути у форматі РРРР-ММ-ДД' })
  dob: string;

  @ApiPropertyOptional({ example: 'м. Київ, вул. Тестова, 10', description: 'Адреса реєстрації' })
  @IsOptional()
  @IsString({ message: 'Адреса має бути рядком' })
  @MaxLength(255, { message: 'Адреса не може бути довшою за 255 символів' })
  address?: string;

  @ApiProperty({ example: 'Київ', description: 'Місто прив’язки епізоду (з довідника cities)' })
  @IsString({ message: 'Місто має бути рядком' })
  @IsNotEmpty({ message: 'Місто є обов’язковим' })
  city: string;

  @ApiProperty({ enum: PERSON_STATUSES, example: 'Підозрюваний', description: 'Процесуальний статус' })
  @IsIn([...PERSON_STATUSES], { message: `Статус має бути одним із: ${PERSON_STATUSES.join(', ')}` })
  status: string;

  @ApiPropertyOptional({ example: 'Текстовий опис ролі особи', description: 'Опис' })
  @IsOptional()
  @IsString({ message: 'Опис має бути рядком' })
  @MaxLength(1000, { message: 'Опис не може бути довшим за 1000 символів' })
  description?: string;

  @ApiPropertyOptional({ type: [Number], example: [1, 4], description: 'Ідентифікатори кваліфікацій із довідника crimes' })
  @IsOptional()
  @IsArray({ message: 'crimeIds має бути масивом' })
  @ArrayMaxSize(20, { message: 'Не більше 20 кваліфікацій' })
  @ArrayUnique({ message: 'Кваліфікації не повинні повторюватися' })
  @IsInt({ each: true, message: 'Кожен ідентифікатор кваліфікації має бути цілим числом' })
  crimeIds?: number[];
}
