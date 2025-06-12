import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technician } from './technician.entity';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';
import { Appliance } from 'src/appliance/appliance.entity';
import { Identity } from 'src/identity/identity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Technician, Appliance, Identity])],
  providers: [TechnicianService],
  controllers: [TechnicianController],
})
export class TechnicianModule {}