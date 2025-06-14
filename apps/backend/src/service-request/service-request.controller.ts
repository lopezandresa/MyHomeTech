import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles }         from '../common/roles.decorator';

import { ServiceRequestService } from './service-request.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { OfferPriceDto } from './dto/offer-price.dto';
import { AcceptRequestDto } from './dto/accept-request.dto';
import { ScheduleRequestDto } from './dto/schedule-request.dto';
import { ServiceRequest } from './service-request.entity';

@ApiTags('service-requests')
@ApiBearerAuth('JWT')
@Controller('service-requests')
export class ServiceRequestController {
  constructor(private readonly svc: ServiceRequestService) {}

  // 1) Cliente crea solicitud
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Post()
  @ApiOperation({ summary: 'Cliente crea una nueva solicitud' })
  create(
    @Request() req,
    @Body() dto: CreateServiceRequestDto,
  ): Promise<ServiceRequest> {
    return this.svc.create(req.user.id, dto);
  }

  // 2) Técnico ve pendientes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Get('pending')
  @ApiOperation({ summary: 'Técnico lista solicitudes pendientes' })
  findPending(): Promise<ServiceRequest[]> {
    return this.svc.findPending();
  }

  // 2b) Técnico ve pendientes filtradas por especialidad
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Get('pending/for-me')
  @ApiOperation({ summary: 'Técnico lista solicitudes pendientes que coinciden con sus especialidades' })
  findPendingForMe(@Request() req): Promise<ServiceRequest[]> {
    return this.svc.findPendingForTechnician(req.user.id);
  }

  // 3) Técnico contraoferta
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Post(':id/offer')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Técnico realiza contraoferta' })
  offer(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: OfferPriceDto,
  ): Promise<ServiceRequest> {
    return this.svc.offerPrice(id, req.user.id, dto);
  }
  // 4) Cliente acepta
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Post(':id/accept')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Cliente acepta la solicitud' })
  accept(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AcceptRequestDto,
  ): Promise<ServiceRequest> {
    return this.svc.accept(id, req.user.id, dto);
  }

  // 5) Técnico agenda
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Post(':id/schedule')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Técnico agenda la solicitud aceptada' })
  schedule(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ScheduleRequestDto,
  ): Promise<ServiceRequest> {
    return this.svc.schedule(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Post(':id/accept-and-schedule')
  @ApiParam({ name: 'id', type: Number, description: 'ID de la solicitud' })
  @ApiOperation({
    summary: 'Técnico acepta la solicitud y la agenda automáticamente',
  })
  async acceptAndSchedule(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceRequest> {
    return this.svc.acceptByTechnician(id, req.user.id);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Get('client/:clientId')
  @ApiParam({ name: 'clientId', type: Number })
  @ApiOperation({ summary: 'Cliente ve su historial de solicitudes con ofertas' })
  findByClient(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<ServiceRequest[]> {
    return this.svc.findByClientWithOffers(clientId);
  }

  

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Get('technician/:techId')
  @ApiParam({ name: 'techId', type: Number })
  @ApiOperation({ summary: 'Técnico ve sus solicitudes asignadas' })
  findByTechnician(
    @Param('techId', ParseIntPipe) techId: number,
  ): Promise<ServiceRequest[]> {
    return this.svc.findByTechnician(techId);
  }

  // 7) Cliente marca como finalizado
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Post(':id/complete')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Cliente marca la solicitud como finalizada' })
  async complete(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceRequest> {
    return this.svc.completeByClient(id, req.user.id);
  }

  // Cliente rechaza oferta del técnico
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Post(':id/reject-offer')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Cliente rechaza la oferta del técnico' })
  async rejectOffer(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceRequest> {
    return this.svc.rejectOfferByClient(id, req.user.id);
  }

  // Cliente acepta oferta específica
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Post(':id/accept-offer/:offerId')
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'offerId', type: Number })
  @ApiOperation({ summary: 'Cliente acepta una oferta específica' })
  async acceptSpecificOffer(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('offerId', ParseIntPipe) offerId: number,
  ): Promise<ServiceRequest> {
    return this.svc.acceptSpecificOffer(id, offerId, req.user.id);
  }

  // Cliente cancela toda la solicitud
  @UseGuards(JwtAuthGuard, RolesGuard)
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

  // 3b) Cliente actualiza precio inicial
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Post(':id/update-price')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Cliente actualiza el precio inicial de su solicitud' })
  updatePrice(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { price: number },
  ): Promise<ServiceRequest> {
    return this.svc.updateClientPrice(id, req.user.id, dto.price);
  }
}