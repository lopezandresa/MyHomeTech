import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequest } from './service-request.entity';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequestController } from './service-request.controller';
import { Identity } from '../identity/identity.entity';
import { Appliance } from '../appliance/appliance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceRequest, Identity, Appliance]),
  ],
  providers: [ServiceRequestService],
  controllers: [ServiceRequestController],
})
export class ServiceRequestModule {}