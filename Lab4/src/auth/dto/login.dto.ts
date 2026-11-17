import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'operator1' })
  @IsNotEmpty({ message: 'Логін є обов’язковим' })
  @IsString({ message: 'Логін має бути рядком' })
  username: string;

  @ApiProperty({ example: 'Strong2027Pass' })
  @IsNotEmpty({ message: 'Пароль є обов’язковим' })
  @IsString({ message: 'Пароль має бути рядком' })
  password: string;
}
