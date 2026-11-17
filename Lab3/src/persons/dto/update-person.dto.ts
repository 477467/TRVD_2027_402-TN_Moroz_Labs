import { PartialType } from '@nestjs/swagger';
import { CreatePersonDto } from './create-person.dto';

/** Часткове оновлення (PATCH): усі поля необов’язкові, правила валідації зберігаються. */
export class UpdatePersonDto extends PartialType(CreatePersonDto) {}
