import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse,
  ApiOkResponse, ApiOperation, ApiParam, ApiTags,
} from '@nestjs/swagger';
import { CreatePersonDto } from './dto/create-person.dto';
import { PersonListResponseDto, PersonResponseDto } from './dto/person-response.dto';
import { QueryPersonsDto } from './dto/query-persons.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonsService } from './persons.service';

/** Контролер не містить логіки: приймає дані, викликає сервіс, повертає результат. */
@ApiTags('persons')
@Controller('persons')
export class PersonsController {
  constructor(private readonly service: PersonsService) {}

  @Get()
  @ApiOperation({ summary: 'Список осіб із пошуком, фільтрами та пагінацією' })
  @ApiOkResponse({ type: PersonListResponseDto })
  @ApiBadRequestResponse({ description: 'Некоректні параметри запиту' })
  list(@Query() query: QueryPersonsDto): Promise<PersonListResponseDto> {
    return this.service.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Картка особи за обліковим номером' })
  @ApiParam({ name: 'id', example: 'CP-001' })
  @ApiOkResponse({ type: PersonResponseDto })
  @ApiNotFoundResponse({ description: 'Особу не знайдено' })
  get(@Param('id') id: string): Promise<PersonResponseDto> {
    return this.service.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Створити обліковий запис особи' })
  @ApiCreatedResponse({ type: PersonResponseDto })
  @ApiBadRequestResponse({ description: 'Помилка валідації або порушення бізнес-правил' })
  create(@Body() dto: CreatePersonDto): Promise<PersonResponseDto> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Повна заміна запису (PUT)' })
  @ApiParam({ name: 'id', example: 'CP-006' })
  @ApiOkResponse({ type: PersonResponseDto })
  @ApiBadRequestResponse({ description: 'Помилка валідації або порушення бізнес-правил' })
  @ApiNotFoundResponse({ description: 'Особу не знайдено' })
  replace(@Param('id') id: string, @Body() dto: CreatePersonDto): Promise<PersonResponseDto> {
    return this.service.replace(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Часткове оновлення запису (PATCH)' })
  @ApiParam({ name: 'id', example: 'CP-006' })
  @ApiOkResponse({ type: PersonResponseDto })
  @ApiBadRequestResponse({ description: 'Помилка валідації або порушення бізнес-правил' })
  @ApiNotFoundResponse({ description: 'Особу не знайдено' })
  update(@Param('id') id: string, @Body() dto: UpdatePersonDto): Promise<PersonResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити запис' })
  @ApiParam({ name: 'id', example: 'CP-006' })
  @ApiNoContentResponse({ description: 'Запис видалено' })
  @ApiNotFoundResponse({ description: 'Особу не знайдено' })
  @ApiConflictResponse({ description: 'До запису прив’язано службові документи' })
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
