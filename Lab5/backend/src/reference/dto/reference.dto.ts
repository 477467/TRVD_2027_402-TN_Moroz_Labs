import { ApiProperty } from '@nestjs/swagger';

export class CityDto {
  @ApiProperty({ example: 'Київ' })
  name: string;

  @ApiProperty({ example: 'Київ' })
  region: string;
}

export class CrimeRefDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: 'ст. 190 ККУ – Шахрайство' })
  title: string;
}
