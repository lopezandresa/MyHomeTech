import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technician } from './technician.entity';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Technician])],
  providers: [TechnicianService],
  controllers: [TechnicianController],
})
export class TechnicianModule {}