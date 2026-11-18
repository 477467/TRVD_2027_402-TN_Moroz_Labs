import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class ChangeRoleDto {
  @ApiProperty({ enum: ['admin', 'operator'], example: 'admin' })
  @IsIn(['admin', 'operator'], { message: 'Роль має бути admin або operator' })
  role: 'admin' | 'operator';
}
