import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequest } from './service-request.entity';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequestController } from './service-request.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest])],
  providers: [ServiceRequestService],
  controllers: [ServiceRequestController],
})
export class ServiceRequestModule {}