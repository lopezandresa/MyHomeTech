import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Put,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequest } from './service-request.entity';
import { ServiceRequestOffer } from './service-request-offer.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { OfferPriceDto } from './dto/offer-price.dto';
import { ProposeAlternativeDateDto } from './dto/propose-alternative-date.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles } from '../common/roles.decorator';
import { AlternativeDateProposal } from './alternative-date-proposal.entity';

@ApiTags('service-requests')
@ApiBearerAuth('JWT')
@Controller('service-requests')
export class ServiceRequestController {
  constructor(
    private readonly svc: ServiceRequestService,
  ) {}

  // 1) Cliente crea solicitud con fecha propuesta
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Cliente crea una nueva solicitud con fecha propuesta y precio' })
  create(
    @Request() req,
    @Body() dto: CreateServiceRequestDto,
  ): Promise<ServiceRequest> {
    return this.svc.create(req.user.id, dto);
  }

  // 2) Técnico ve solicitudes pendientes (todas)
  @UseGuards(JwtAuthGuard)
  @Roles('technician')
  @Get('pending')
  @ApiOperation({ summary: 'Técnico lista todas las solicitudes pendientes' })
  findPending(): Promise<ServiceRequest[]> {
    return this.svc.findPending();
  }

  // 2b) Técnico ve solicitudes disponibles para él (filtradas por especialidad y disponibilidad)
  @UseGuards(JwtAuthGuard)
  @Roles('technician')
  @Get('available-for-me')
  @ApiOperation({ summary: 'Técnico lista solicitudes disponibles para él (por especialidad y horario)' })  findAvailableForMe(@Request() req): Promise<ServiceRequest[]> {
    return this.svc.findPendingForTechnician(req.user.id);
  }

  // 3) Técnico acepta una solicitud directamente (sin negociación de precio)
  @UseGuards(JwtAuthGuard)
  @Roles('technician')
  @Post(':id/accept')
  @ApiParam({ name: 'id', type: Number, description: 'ID de la solicitud' })
  @ApiOperation({ summary: 'Técnico acepta una solicitud y la agenda automáticamente' })
  async acceptRequest(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceRequest> {
    return this.svc.acceptByTechnician(id, req.user.id);
  }

  // NUEVO: Técnico hace una oferta con precio personalizado
  @UseGuards(JwtAuthGuard)
  @Roles('technician')
  @Post(':id/offer')
  @ApiParam({ name: 'id', type: Number, description: 'ID de la solicitud' })
  @ApiOperation({ summary: 'Técnico hace una oferta con precio personalizado' })
  @ApiBody({ type: OfferPriceDto })
  async offerPrice(
    @Request() req,
    @Param('id', ParseIntPipe) serviceRequestId: number,
    @Body() dto: OfferPriceDto,
  ): Promise<ServiceRequestOffer> {
    return this.svc.offerPrice(serviceRequestId, req.user.id, dto);
  }

  // NUEVO: Cliente acepta una oferta específica
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @Post(':id/accept-offer/:offerId')
  @ApiParam({ name: 'id', type: Number, description: 'ID de la solicitud' })
  @ApiParam({ name: 'offerId', type: Number, description: 'ID de la oferta a aceptar' })
  @ApiOperation({ summary: 'Cliente acepta una oferta específica de un técnico' })
  async acceptOffer(
    @Request() req,
    @Param('id', ParseIntPipe) serviceRequestId: number,
    @Param('offerId', ParseIntPipe) offerId: number,
  ): Promise<ServiceRequest> {
    return this.svc.acceptOffer(serviceRequestId, offerId, req.user.id);
  }

  // NUEVO: Cliente obtiene sus solicitudes con todas las ofertas
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @Get('my-requests-with-offers')
  @ApiOperation({ summary: 'Cliente obtiene sus solicitudes con todas las ofertas recibidas' })
  getMyRequestsWithOffers(@Request() req): Promise<ServiceRequest[]> {
    return this.svc.getClientRequestsWithOffers(req.user.id);
  }

  // NUEVO: Cliente actualiza el precio de su solicitud
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @Put(':id/update-price')
  @ApiParam({ name: 'id', type: Number, description: 'ID de la solicitud' })
  @ApiOperation({ summary: 'Cliente actualiza el precio de su solicitud' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newPrice: {
          type: 'number',
          description: 'Nuevo precio ofrecido por el cliente',
          example: 60000
        }
      },
      required: ['newPrice']
    }
  })
  async updatePrice(
    @Request() req,
    @Param('id', ParseIntPipe) serviceRequestId: number,
    @Body('newPrice') newPrice: number,
  ): Promise<ServiceRequest> {
    return this.svc.updateClientPrice(serviceRequestId, req.user.id, newPrice);
  }

  // 4) Cliente marca servicio como completado
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @Post(':id/complete')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Cliente marca la solicitud como completada' })
  async complete(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceRequest> {
    return this.svc.completeByClient(id, req.user.id);
  }

  // 5) Cliente cancela solicitud
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @Post(':id/cancel')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Cliente cancela su solicitud' })
  async cancelRequest(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceRequest> {
    return this.svc.cancelByClient(id, req.user.id);
  }

  // 6) Consultas auxiliares
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene detalles de una solicitud' })
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceRequest | null> {
    return this.svc.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @Get('client/:clientId')
  @ApiParam({ name: 'clientId', type: Number })
  @ApiOperation({ summary: 'Cliente ve su historial de solicitudes' })
  findByClient(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<ServiceRequest[]> {
    return this.svc.findByClient(clientId);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('technician')
  @Get('technician/:techId')
  @ApiParam({ name: 'techId', type: Number })
  @ApiOperation({ summary: 'Técnico ve sus solicitudes asignadas' })
  findByTechnician(
    @Param('techId', ParseIntPipe) techId: number,
  ): Promise<ServiceRequest[]> {
    return this.svc.findByTechnician(techId);
  }

  // 7) Endpoints de calendario
  @UseGuards(JwtAuthGuard)
  @Roles('technician')
  @Get('calendar/technician/:techId')
  @ApiParam({ name: 'techId', type: Number })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha inicio (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha fin (ISO string)' })
  @ApiOperation({ summary: 'Obtener calendario de técnico' })
  getTechnicianCalendar(
    @Param('techId', ParseIntPipe) techId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ServiceRequest[]> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.svc.getTechnicianCalendar(techId, start, end);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @Get('calendar/client/:clientId')
  @ApiParam({ name: 'clientId', type: Number })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha inicio (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha fin (ISO string)' })
  @ApiOperation({ summary: 'Obtener calendario de cliente' })
  getClientCalendar(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ServiceRequest[]> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.svc.getClientCalendar(clientId, start, end);
  }

  // 8) Verificar disponibilidad de técnico
  @UseGuards(JwtAuthGuard)
  @Roles('technician')
  @Get('availability/check')
  @ApiQuery({ name: 'dateTime', required: true, description: 'Fecha y hora a verificar (ISO string)' })
  @ApiOperation({ summary: 'Verificar si el técnico tiene disponibilidad en una fecha específica' })
  async checkAvailability(
    @Request() req,
    @Query('dateTime') dateTime: string,
  ): Promise<{ 
    available: boolean; 
    reason?: string;
    conflictingService?: {
      id: number;
      scheduledAt: Date;
      appliance: string;
      clientName: string;
    }  }> {
    const proposedDate = new Date(dateTime);
    return this.svc.checkTechnicianAvailabilityDetailed(req.user.id, proposedDate);
  }

  // Técnico propone fecha alternativa
  @UseGuards(JwtAuthGuard)
  @Roles('technician')
  @Post(':id/propose-alternative-date')
  @ApiOperation({ summary: 'Técnico propone fecha alternativa para una solicitud' })
  @ApiParam({ name: 'id', description: 'ID de la solicitud de servicio' })
  @ApiBody({ type: ProposeAlternativeDateDto })
  proposeAlternativeDate(
    @Param('id', ParseIntPipe) serviceRequestId: number,
    @Request() req,
    @Body() dto: ProposeAlternativeDateDto,
  ): Promise<AlternativeDateProposal> {
    return this.svc.proposeAlternativeDate(serviceRequestId, req.user.id, dto.alternativeDateTime, dto.comment);
  }

  // Cliente acepta propuesta de fecha alternativa
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @Post('proposals/:proposalId/accept')
  @ApiOperation({ summary: 'Cliente acepta una propuesta de fecha alternativa' })
  @ApiParam({ name: 'proposalId', description: 'ID de la propuesta de fecha alternativa' })
  acceptAlternativeDateProposal(
    @Param('proposalId', ParseIntPipe) proposalId: number,
    @Request() req,
  ): Promise<ServiceRequest> {
    return this.svc.acceptAlternativeDateByProposalId(proposalId, req.user.id);
  }

  // Cliente rechaza propuesta de fecha alternativa
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @Post('proposals/:proposalId/reject')
  @ApiOperation({ summary: 'Cliente rechaza una propuesta de fecha alternativa' })
  @ApiParam({ name: 'proposalId', description: 'ID de la propuesta de fecha alternativa' })
  rejectAlternativeDateProposal(
    @Param('proposalId', ParseIntPipe) proposalId: number,
    @Request() req,
  ): Promise<AlternativeDateProposal> {
    return this.svc.rejectAlternativeDateByProposalId(proposalId, req.user.id);
  }

  // Obtener propuestas de fechas alternativas para una solicitud
  @UseGuards(JwtAuthGuard)
  @Get(':id/alternative-date-proposals')
  @ApiOperation({ summary: 'Obtener propuestas de fechas alternativas para una solicitud' })
  @ApiParam({ name: 'id', description: 'ID de la solicitud de servicio' })
  getAlternativeDateProposals(
    @Param('id', ParseIntPipe) serviceRequestId: number,
  ): Promise<AlternativeDateProposal[]> {
    return this.svc.getAlternativeDateProposals(serviceRequestId);
  }

  // Técnico obtiene sus propuestas de fechas alternativas
  @UseGuards(JwtAuthGuard)
  @Roles('technician')
  @Get('technician/alternative-date-proposals')
  @ApiOperation({ summary: 'Técnico obtiene sus propuestas de fechas alternativas' })
  getTechnicianAlternativeDateProposals(
    @Request() req,
  ): Promise<AlternativeDateProposal[]> {
    return this.svc.getTechnicianAlternativeDateProposals(req.user.id);
  }
}