import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'operator1', description: 'Логін: 3–50 символів, латиниця, цифри, . _ -' })
  @Matches(/^[A-Za-z0-9._-]+$/, { message: 'Логін може містити лише латиницю, цифри та символи . _ -' })
  @MaxLength(50, { message: 'Логін не може бути довшим за 50 символів' })
  @MinLength(3, { message: 'Логін має містити щонайменше 3 символи' })
  @IsString({ message: 'Логін має бути рядком' })
  username: string;

  @ApiProperty({ example: 'Strong2027Pass', description: 'Пароль: від 8 символів, має містити літеру та цифру' })
  @Matches(/(?=.*\p{L})(?=.*\d)/u, { message: 'Пароль має містити щонайменше одну літеру та одну цифру' })
  @MaxLength(72, { message: 'Пароль не може бути довшим за 72 символи' })
  @MinLength(8, { message: 'Пароль має містити щонайменше 8 символів' })
  @IsString({ message: 'Пароль має бути рядком' })
  password: string;
}
