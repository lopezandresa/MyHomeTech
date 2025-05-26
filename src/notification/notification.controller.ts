import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() dto: Partial<Notification>) {
    return this.notificationService.create(dto);
  }

  @Get('user/:id')
  findAll(@Param('id') id: number): Promise<Notification[]> {
    return this.notificationService.findAllForUser(id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: number) {
    return this.notificationService.markRead(id);
  }
}