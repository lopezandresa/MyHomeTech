import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequest } from './service-request.entity';
import { ServiceRequestOffer } from './service-request-offer.entity';
import { AlternativeDateProposal } from './alternative-date-proposal.entity';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequestController } from './service-request.controller';
import { ServiceRequestGateway } from './service-request.gateway';
import { Identity } from '../identity/identity.entity';
import { Appliance } from '../appliance/appliance.entity';
import { Address } from '../address/address.entity';
import { Technician } from '../technician/technician.entity';

@Module({
  imports: [    TypeOrmModule.forFeature([
      ServiceRequest, 
      ServiceRequestOffer, 
      AlternativeDateProposal,
      Identity, 
      Appliance, 
      Address, 
      Technician
    ]),
  ],
  providers: [ServiceRequestService, ServiceRequestGateway],
  controllers: [ServiceRequestController],
  exports: [ServiceRequestGateway, ServiceRequestService],
})
export class ServiceRequestModule {}