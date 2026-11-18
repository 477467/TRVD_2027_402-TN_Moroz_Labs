import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from '../entities/city.entity';
import { Crime } from '../entities/crime.entity';
import { ReferenceController } from './reference.controller';
import { ReferenceService } from './reference.service';

@Module({
  imports: [TypeOrmModule.forFeature([City, Crime])],
  controllers: [ReferenceController],
  providers: [ReferenceService],
})
export class ReferenceModule {}
