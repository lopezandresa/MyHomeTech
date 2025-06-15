import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technician } from './technician.entity';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';
import { ApplianceType } from 'src/appliance-type/appliance-type.entity';
import { Identity } from 'src/identity/identity.entity';
import { CloudinaryService } from 'src/common/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Technician, ApplianceType, Identity])],
  providers: [TechnicianService, CloudinaryService],
  controllers: [TechnicianController],
})
export class TechnicianModule {}