import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { HelpTicketService } from './help-ticket.service';
import { CreateHelpTicketDto } from './dto/create-help-ticket.dto';
import { RespondHelpTicketDto } from './dto/respond-help-ticket.dto';
import { HelpTicketStatus, HelpTicketType } from './help-ticket.entity';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/roles.decorator';

@ApiTags('Help Tickets')
@Controller('help-tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class HelpTicketController {
  constructor(private readonly helpTicketService: HelpTicketService) {}

  /**
   * Crear un nuevo ticket de ayuda
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo ticket de ayuda' })
  async createTicket(@Request() req, @Body() dto: CreateHelpTicketDto) {
    return await this.helpTicketService.createTicket(req.user.id, dto);
  }

  /**
   * Obtener tickets del usuario autenticado
   */
  @Get('my-tickets')
  @ApiOperation({ summary: 'Obtener mis tickets de ayuda' })
  async getMyTickets(@Request() req) {
    return await this.helpTicketService.getUserTickets(req.user.id);
  }

  /**
   * Obtener todos los tickets (solo administradores)
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todos los tickets de ayuda (solo admin)' })
  @ApiQuery({ name: 'status', enum: HelpTicketStatus, required: false })
  @ApiQuery({ name: 'type', enum: HelpTicketType, required: false })
  async getAllTickets(
    @Query('status') status?: HelpTicketStatus,
    @Query('type') type?: HelpTicketType
  ) {
    return await this.helpTicketService.getAllTickets(status, type);
  }

  /**
   * Obtener estadísticas de tickets (solo administradores)
   */
  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener estadísticas de tickets (solo admin)' })
  async getTicketStats() {
    return await this.helpTicketService.getTicketStats();
  }

  /**
   * Obtener un ticket específico
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un ticket por ID' })
  @ApiParam({ name: 'id', description: 'ID del ticket' })
  async getTicket(@Param('id') id: number, @Request() req) {
    return await this.helpTicketService.getTicketById(id, req.user.id);
  }

  /**
   * Responder a un ticket (solo administradores)
   */
  @Patch(':id/respond')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Responder a un ticket de ayuda (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID del ticket' })
  async respondToTicket(
    @Param('id') id: number,
    @Request() req,
    @Body() dto: RespondHelpTicketDto
  ) {
    return await this.helpTicketService.respondToTicket(id, req.user.id, dto);
  }

  /**
   * Asignar ticket a un administrador (solo administradores)
   */
  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Asignar ticket a un administrador (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID del ticket' })
  async assignTicket(
    @Param('id') id: number,
    @Request() req,
    @Body() body: { assignedAdminId: number }
  ) {
    return await this.helpTicketService.assignTicket(id, req.user.id, body.assignedAdminId);
  }

  /**
   * Actualizar estado de un ticket (solo administradores)
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar estado de un ticket (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID del ticket' })
  async updateTicketStatus(
    @Param('id') id: number,
    @Request() req,
    @Body() body: { status: HelpTicketStatus }
  ) {
    return await this.helpTicketService.updateTicketStatus(id, req.user.id, body.status);
  }

  /**
   * Agregar respuesta de administrador a un ticket
   */
  @Post(':id/admin-response')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Agregar respuesta de administrador (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID del ticket' })
  async addAdminResponse(
    @Param('id') id: number,
    @Request() req,
    @Body() body: { message: string }
  ) {
    return await this.helpTicketService.addAdminResponse(id, req.user.id, body.message);
  }
}