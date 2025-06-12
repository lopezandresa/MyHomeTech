import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './notification.entity';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva notificación' })
  create(@Body() dto: CreateNotificationDto): Promise<Notification> {
    return this.notificationService.create(dto);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Obtiene notificaciones de un usuario' })
  findAll(@Param('id') id: number): Promise<Notification[]> {
    return this.notificationService.findAllForUser(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marca una notificación como leída' })
  markRead(@Param('id') id: number) {
    return this.notificationService.markRead(id);
  }
}