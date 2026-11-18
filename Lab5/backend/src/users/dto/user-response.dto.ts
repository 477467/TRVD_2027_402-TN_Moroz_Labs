import { ApiProperty } from '@nestjs/swagger';

/** Модель користувача для клієнта: без хеша пароля. */
export class UserResponseDto {
  @ApiProperty({ example: '0b0e5c1e-6d4e-4c33-9d5b-3f1a2c9e7a10' })
  id: string;

  @ApiProperty({ example: 'operator1' })
  username: string;

  @ApiProperty({ enum: ['admin', 'operator'], example: 'operator' })
  role: string;

  @ApiProperty({ example: '2027-03-01T09:30:00.000Z' })
  createdAt: string;
}
