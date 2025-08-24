import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institution } from '../../../entities/institution.entity';
import { InstitutionService } from './institution.service';

@Module({
  imports: [TypeOrmModule.forFeature([Institution])],
  providers: [InstitutionService],
  exports: [InstitutionService],
})
export class InstitutionModule {}
