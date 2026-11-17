import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDto {
  @ApiProperty({ description: 'Access-токен (JWT) для заголовка Authorization: Bearer' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh-токен для отримання нової пари токенів' })
  refreshToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: 900, description: 'Термін дії access-токена, секунд' })
  expiresIn: number;
}
