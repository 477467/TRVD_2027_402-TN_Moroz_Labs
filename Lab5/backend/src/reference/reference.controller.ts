import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CityDto, CrimeRefDto } from './dto/reference.dto';
import { ReferenceService } from './reference.service';

/** Довідники доступні будь-якому авторизованому користувачеві (глобальний JwtAuthGuard). */
@ApiTags('reference')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Токен відсутній або недійсний' })
@Controller()
export class ReferenceController {
  constructor(private readonly service: ReferenceService) {}

  @Get('cities')
  @ApiOperation({ summary: 'Довідник міст' })
  @ApiOkResponse({ type: [CityDto] })
  cities(): Promise<CityDto[]> {
    return this.service.listCities();
  }

  @Get('crimes')
  @ApiOperation({ summary: 'Довідник кваліфікацій правопорушень' })
  @ApiOkResponse({ type: [CrimeRefDto] })
  crimes(): Promise<CrimeRefDto[]> {
    return this.service.listCrimes();
  }
}
