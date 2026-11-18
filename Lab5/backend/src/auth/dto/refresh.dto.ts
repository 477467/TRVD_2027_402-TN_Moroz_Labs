import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh-токен, отриманий при вході' })
  @IsNotEmpty({ message: 'Refresh-токен є обов’язковим' })
  @IsString({ message: 'Refresh-токен має бути рядком' })
  refreshToken: string;
}
