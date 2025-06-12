import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technician } from './technician.entity';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';
import { ApplianceType } from 'src/appliance-type/appliance-type.entity';
import { Identity } from 'src/identity/identity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Technician, ApplianceType, Identity])],
  providers: [TechnicianService],
  controllers: [TechnicianController],
})
export class TechnicianModule {}