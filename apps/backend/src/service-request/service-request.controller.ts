/**
 * @fileoverview Controlador principal de solicitudes de servicio - MyHomeTech
 * 
 * @description Maneja todas las operaciones del sistema de solicitudes de servicio:
 * - Creación de solicitudes por clientes
 * - Gestión de ofertas y propuestas por técnicos
 * - Sistema de calendario y disponibilidad
 * - Propuestas de fechas alternativas
 * - Estados de servicio (pendiente, asignado, completado, cancelado)
 * 
 * @version 1.0.0
 * @author Equipo MyHomeTech
 * @since 2024
 */

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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequest } from './service-request.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { ProposeAlternativeDateDto } from './dto/propose-alternative-date.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles } from '../common/roles.decorator';
import { AlternativeDateProposal } from './alternative-date-proposal.entity';

/**
 * Controlador de solicitudes de servicio
 * 
 * @description Expone endpoints para el sistema completo de solicitudes de servicio:
 * - CRUD de solicitudes
 * - Sistema multi-ofertas entre técnicos
 * - Gestión de calendario y disponibilidad
 * - Propuestas de fechas alternativas
 * - Estados y transiciones de servicios
 * 
 * @example
 * ```typescript
 * // Endpoints principales:
 * POST /api/service-requests - Crear solicitud
 * GET /api/service-requests/pending - Ver solicitudes pendientes
 * POST /api/service-requests/:id/accept - Aceptar solicitud
 * GET /api/service-requests/calendar/technician/:id - Calendario técnico
 * ```
 */
@ApiTags('service-requests')
@ApiBearerAuth('JWT')
@Controller('service-requests')
export class ServiceRequestController {
  /**
   * Constructor del controlador de solicitudes
   * 
   * @param {ServiceRequestService} svc - Servicio de solicitudes inyectado
   */
  constructor(
    private readonly svc: ServiceRequestService,
  ) {}

  /**
   * Crear nueva solicitud de servicio (Cliente)
   * 
   * @description Permite a un cliente crear una nueva solicitud de servicio
   * con fecha propuesta. El sistema validará la disponibilidad y creará
   * la solicitud en estado 'pending'
   * 
   * @param {Request} req - Request con información del usuario autenticado
   * @param {CreateServiceRequestDto} dto - Datos de la solicitud
   * @returns {Promise<ServiceRequest>} Solicitud creada
   * 
   * @example
   * ```typescript
   * // POST /api/service-requests
   * const newRequest = {
   *   applianceId: 1,
   *   serviceRequestTypeId: 2,
   *   addressId: 3,
   *   proposedDateTime: "2024-06-20T10:00:00Z",
   *   description: "Lavadora no enciende"
   * };
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Cliente crea una nueva solicitud con fecha propuesta' })
  create(
    @Request() req,
    @Body() dto: CreateServiceRequestDto,
  ): Promise<ServiceRequest> {
    return this.svc.create(req.user.id, dto);
  }

  /**
   * Listar solicitudes pendientes (Técnico)
   * 
   * @description Permite a un técnico ver todas las solicitudes pendientes
   * disponibles en el sistema para hacer ofertas
   * 
   * @returns {Promise<ServiceRequest[]>} Lista de solicitudes pendientes
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/pending
   * // Retorna solicitudes con estado 'pending'
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Roles('technician')
  @Get('pending')
  @ApiOperation({ summary: 'Técnico lista todas las solicitudes pendientes' })
  findPending(): Promise<ServiceRequest[]> {
    return this.svc.findPending();
  }

  /**
   * Obtener todas las solicitudes (Administrador)
   * 
   * @description Permite al administrador ver todas las solicitudes
   * del sistema para estadísticas y monitoreo
   * 
   * @returns {Promise<ServiceRequest[]>} Todas las solicitudes
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/all
   * // Solo accesible por administradores
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Get('all')
  @ApiOperation({ summary: 'Administrador obtiene todas las solicitudes para estadísticas' })
  findAll(): Promise<ServiceRequest[]> {
    return this.svc.findAll();
  }

  /**
   * Solicitudes disponibles para técnico específico
   * 
   * @description Filtra solicitudes pendientes según la especialidad
   * y disponibilidad del técnico autenticado
   * 
   * @param {Request} req - Request con ID del técnico
   * @returns {Promise<ServiceRequest[]>} Solicitudes filtradas
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/available-for-me
   * // Filtra por especialidades del técnico
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Roles('technician')
  @Get('available-for-me')
  @ApiOperation({ summary: 'Técnico lista solicitudes disponibles para él (por especialidad y horario)' })
  findAvailableForMe(@Request() req): Promise<ServiceRequest[]> {
    return this.svc.findPendingForTechnician(req.user.id);
  }

  /**
   * Aceptar solicitud directamente (Técnico)
   * 
   * @description Permite a un técnico aceptar una solicitud sin negociación,
   * agendándola automáticamente en la fecha propuesta
   * 
   * @param {Request} req - Request con ID del técnico
   * @param {number} id - ID de la solicitud
   * @returns {Promise<ServiceRequest>} Solicitud aceptada y agendada
   * 
   * @example
   * ```typescript
   * // POST /api/service-requests/123/accept
   * // Cambia estado a 'assigned' y agenda el servicio
   * ```
   */
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

  /**
   * Obtener solicitudes del cliente con ofertas (Cliente)
   * 
   * @description Permite al cliente ver todas sus solicitudes
   * con las propuestas y ofertas recibidas de técnicos
   * 
   * @param {Request} req - Request con ID del cliente
   * @returns {Promise<ServiceRequest[]>} Solicitudes con ofertas
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/my-requests
   * // Incluye propuestas de fechas alternativas
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @Get('my-requests')
  @ApiOperation({ summary: 'Cliente obtiene sus solicitudes con todas las propuestas recibidas' })
  getMyRequestsWithOffers(@Request() req): Promise<ServiceRequest[]> {
    return this.svc.getClientRequests(req.user.id);
  }

  /**
   * Marcar servicio como completado (Cliente)
   * 
   * @description Permite a un cliente marcar una solicitud como completada
   * una vez que el servicio ha sido realizado
   * 
   * @param {Request} req - Request con ID del cliente
   * @param {number} id - ID de la solicitud
   * @returns {Promise<ServiceRequest>} Solicitud actualizada a estado 'completed'
   * 
   * @example
   * ```typescript
   * // POST /api/service-requests/456/complete
   * // Cambia estado a 'completed'
   * ```
   */
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

  /**
   * Cancelar solicitud (Cliente)
   * 
   * @description Permite a un cliente cancelar una solicitud existente.
   * Si la solicitud ya tiene una fecha y hora asignada, se debe verificar
   * la política de cancelación (por ejemplo, con menos de 24 horas puede no
   * ser permitido).
   * 
   * @param {Request} req - Request con ID del cliente
   * @param {number} id - ID de la solicitud
   * @returns {Promise<ServiceRequest>} Solicitud actualizada a estado 'canceled'
   * 
   * @example
   * ```typescript
   * // POST /api/service-requests/789/cancel
   * // Cambia estado a 'canceled'
   * ```
   */
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

  /**
   * Validar disponibilidad del cliente para una fecha específica
   * 
   * @description Permite al frontend verificar si un cliente puede crear
   * una solicitud para una fecha específica antes de enviar el formulario
   * 
   * @param {Request} req - Request con información del usuario autenticado
   * @param {string} proposedDateTime - Fecha y hora propuesta en formato ISO
   * @returns {Promise<{ isAvailable: boolean, message?: string }>} Estado de disponibilidad
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/validate-availability?proposedDateTime=2024-12-20T10:00:00Z
   * const availability = await fetch('/api/service-requests/validate-availability?proposedDateTime=2024-12-20T10:00:00Z');
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Get('validate-availability')
  @ApiOperation({ summary: 'Validar disponibilidad del cliente para una fecha específica' })
  @ApiQuery({ 
    name: 'proposedDateTime', 
    description: 'Fecha y hora propuesta en formato ISO',
    example: '2024-12-20T10:00:00Z'
  })
  validateAvailability(
    @Request() req,
    @Query('proposedDateTime') proposedDateTime: string,
  ): Promise<{ isAvailable: boolean; message?: string }> {
    console.log('🔍 validateAvailability called with:', {
      proposedDateTime,
      userId: req.user?.id,
      userExists: !!req.user
    });

    // Validar que se proporcione el parámetro
    if (!proposedDateTime) {
      console.log('❌ Missing proposedDateTime parameter');
      throw new BadRequestException('El parámetro proposedDateTime es requerido');
    }

    // Validar que sea una fecha válida
    const proposedDate = new Date(proposedDateTime);
    if (isNaN(proposedDate.getTime())) {
      console.log('❌ Invalid date format:', proposedDateTime);
      throw new BadRequestException('El parámetro proposedDateTime debe ser una fecha válida en formato ISO');
    }

    console.log('✅ Calling service with valid parameters:', {
      clientId: req.user.id,
      proposedDate: proposedDate.toISOString()
    });

    return this.svc.validateClientAvailability(req.user.id, proposedDate);
  }

  /**
   * Obtener detalles de una solicitud
   * 
   * @description Permite a un usuario obtener información detallada
   * sobre una solicitud específica, incluyendo estado, fechas y técnico asignado
   * 
   * @param {number} id - ID de la solicitud
   * @returns {Promise<ServiceRequest | null>} Detalles de la solicitud
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/101
   * // Retorna la solicitud con ID 101
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene detalles de una solicitud' })
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceRequest | null> {
    return this.svc.findById(id);
  }

  /**
   * Historial de solicitudes del cliente
   * 
   * @description Permite a un cliente ver el historial de sus solicitudes
   * anteriores, incluyendo estados y fechas
   * 
   * @param {number} clientId - ID del cliente
   * @returns {Promise<ServiceRequest[]>} Lista de solicitudes del cliente
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/client/1
   * // Retorna todas las solicitudes del cliente con ID 1
   * ```
   */
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

  /**
   * Solicitudes asignadas al técnico
   * 
   * @description Permite a un técnico ver todas las solicitudes que tiene
   * asignadas actualmente, con detalles de estado y fechas
   * 
   * @param {number} techId - ID del técnico
   * @returns {Promise<ServiceRequest[]>} Lista de solicitudes asignadas
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/technician/2
   * // Retorna todas las solicitudes asignadas al técnico con ID 2
   * ```
   */
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

  /**
   * Obtener calendario de disponibilidad del técnico
   * 
   * @description Permite a un técnico y a la administración ver el calendario
   * de un técnico específico, con las solicitudes ya agendadas y los espacios
   * disponibles
   * 
   * @param {number} techId - ID del técnico
   * @param {string} startDate - Fecha inicio del rango a consultar (opcional)
   * @param {string} endDate - Fecha fin del rango a consultar (opcional)
   * @returns {Promise<ServiceRequest[]>} Eventos del calendario del técnico
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/calendar/technician/2?startDate=2024-06-01&endDate=2024-06-30
   * // Retorna el calendario de junio 2024 del técnico con ID 2
   * ```
   */
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

  /**
   * Obtener calendario de un cliente
   * 
   * @description Permite a un cliente ver su calendario personal con las
   * solicitudes agendadas y sus estados
   * 
   * @param {number} clientId - ID del cliente
   * @param {string} startDate - Fecha inicio del rango a consultar (opcional)
   * @param {string} endDate - Fecha fin del rango a consultar (opcional)
   * @returns {Promise<ServiceRequest[]>} Eventos del calendario del cliente
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/calendar/client/1?startDate=2024-06-01&endDate=2024-06-30
   * // Retorna el calendario de junio 2024 del cliente con ID 1
   * ```
   */
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

  /**
   * Verificar disponibilidad de técnico
   * 
   * @description Verifica si el técnico tiene disponibilidad en una fecha
   * específica, incluyendo detalles de conflictos si los hay
   * 
   * @param {Request} req - Request con ID del técnico
   * @param {string} dateTime - Fecha a verificar (ISO string)
   * @returns {Promise<object>} Estado de disponibilidad con detalles
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/availability/check?dateTime=2024-06-20T10:00:00Z
   * // Retorna: { available: false, reason: "conflict", conflictingService: {...} }
   * ```
   */
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

  /**
   * Proponer fecha alternativa para una solicitud (Técnico)
   * 
   * @description Permite a un técnico proponer una fecha y hora alternativa
   * para una solicitud, en caso de que la fecha original no sea conveniente.
   * La propuesta será enviada al cliente para su aprobación.
   * 
   * @param {number} serviceRequestId - ID de la solicitud a modificar
   * @param {Request} req - Request con ID del técnico
   * @param {ProposeAlternativeDateDto} dto - Datos de la nueva fecha propuesta
   * @returns {Promise<AlternativeDateProposal>} Propuesta de fecha alternativa creada
   * 
   * @example
   * ```typescript
   * // POST /api/service-requests/456/propose-alternative-date
   * const proposal = {
   *   alternativeDateTime: "2024-06-21T15:00:00Z",
   *   comment: "El técnico estará disponible a esta hora"
   * };
   * // El técnico sugiere el 21 de junio a las 15:00
   * ```
   */
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

  /**
   * Aceptar propuesta de fecha alternativa (Cliente)
   * 
   * @description Permite a un cliente aceptar una propuesta de fecha alternativa
   * realizada por un técnico para una solicitud existente.
   * 
   * @param {number} proposalId - ID de la propuesta a aceptar
   * @param {Request} req - Request con ID del cliente
   * @returns {Promise<ServiceRequest>} Solicitud actualizada con la nueva fecha
   * 
   * @example
   * ```typescript
   * // POST /api/service-requests/proposals/789/accept
   * // Cambia la fecha de la solicitud a la propuesta aceptada
   * ```
   */
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

  /**
   * Rechazar propuesta de fecha alternativa (Cliente)
   * 
   * @description Permite a un cliente rechazar una propuesta de fecha alternativa
   * realizada por un técnico para una solicitud existente.
   * 
   * @param {number} proposalId - ID de la propuesta a rechazar
   * @param {Request} req - Request con ID del cliente
   * @returns {Promise<AlternativeDateProposal>} Propuesta de fecha alternativa rechazada
   * 
   * @example
   * ```typescript
   * // POST /api/service-requests/proposals/789/reject
   * // Rechaza la propuesta de fecha alternativa con ID 789
   * ```
   */
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

  /**
   * Obtener propuestas de fechas alternativas para una solicitud
   * 
   * @description Permite a un cliente obtener todas las propuestas de fechas
   * alternativas recibidas para una solicitud, incluyendo el estado de cada propuesta
   * 
   * @param {number} serviceRequestId - ID de la solicitud
   * @returns {Promise<AlternativeDateProposal[]>} Lista de propuestas alternativas
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/456/alternative-date-proposals
   * // Retorna todas las propuestas de fecha alternativa para la solicitud 456
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/alternative-date-proposals')
  @ApiOperation({ summary: 'Obtener propuestas de fechas alternativas para una solicitud' })
  @ApiParam({ name: 'id', description: 'ID de la solicitud de servicio' })
  getAlternativeDateProposals(
    @Param('id', ParseIntPipe) serviceRequestId: number,
  ): Promise<AlternativeDateProposal[]> {
    return this.svc.getAlternativeDateProposals(serviceRequestId);
  }

  /**
   * Propuestas de fechas alternativas del técnico
   * 
   * @description Permite a un técnico ver todas las propuestas de fechas
   * alternativas que ha realizado, junto con el estado de cada una
   * 
   * @param {Request} req - Request con ID del técnico
   * @returns {Promise<AlternativeDateProposal[]>} Lista de propuestas del técnico
   * 
   * @example
   * ```typescript
   * // GET /api/service-requests/technician/alternative-date-proposals
   * // Retorna todas las propuestas de fecha alternativa del técnico autenticado
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Roles('technician')
  @Get('technician/alternative-date-proposals')
  @ApiOperation({ summary: 'Técnico obtiene sus propuestas de fechas alternativas' })
  getTechnicianAlternativeDateProposals(
    @Request() req,
  ): Promise<AlternativeDateProposal[]> {    return this.svc.getTechnicianAlternativeDateProposals(req.user.id);
  }
}