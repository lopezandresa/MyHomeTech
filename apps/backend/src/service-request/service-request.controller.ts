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
  @ApiOperation({ summary: 'Cliente ve su historial de solicitudes' })
  findByClient(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<ServiceRequest[]> {
    return this.svc.findByClient(clientId);
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

  // 8) Técnico rechaza solicitud
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Post(':id/reject')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Técnico rechaza la solicitud' })
  async reject(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceRequest> {
    return this.svc.rejectByTechnician(id, req.user.id);
  }
}