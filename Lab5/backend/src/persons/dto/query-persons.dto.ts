import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PERSON_STATUSES } from '../persons.constants';

/** Параметри пошуку, фільтрації та пагінації для GET /persons. */
export class QueryPersonsDto {
  @ApiPropertyOptional({ description: 'Пошук за будь-яким фрагментом: прізвище, ім’я, ID, дата, місто, опис, кваліфікація' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Київ', description: 'Фільтр за містом' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: PERSON_STATUSES, description: 'Фільтр за статусом' })
  @IsOptional()
  @IsIn([...PERSON_STATUSES], { message: `Статус має бути одним із: ${PERSON_STATUSES.join(', ')}` })
  status?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page має бути цілим числом' })
  @Min(1, { message: 'page має бути не меншим за 1' })
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit має бути цілим числом' })
  @Min(1, { message: 'limit має бути не меншим за 1' })
  @Max(100, { message: 'limit не може перевищувати 100' })
  limit: number = 10;
}
