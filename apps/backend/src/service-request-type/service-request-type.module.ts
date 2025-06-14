import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequestType } from './service-request-type.entity';
import { ServiceRequestTypeService } from './service-request-type.service';
import { ServiceRequestTypeController } from './service-request-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequestType])],
  controllers: [ServiceRequestTypeController],
  providers: [ServiceRequestTypeService],
  exports: [ServiceRequestTypeService],
})
export class ServiceRequestTypeModule {}