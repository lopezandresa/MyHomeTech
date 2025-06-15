import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpTicket } from './help-ticket.entity';
import { ServiceRequest } from '../service-request/service-request.entity';
import { Identity } from '../identity/identity.entity';
import { HelpTicketService } from './help-ticket.service';
import { HelpTicketController } from './help-ticket.controller';
import { ServiceRequestGateway } from '../service-request/service-request.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([HelpTicket, ServiceRequest, Identity])
  ],
  controllers: [HelpTicketController],
  providers: [HelpTicketService, ServiceRequestGateway],
  exports: [HelpTicketService]
})
export class HelpTicketModule {}