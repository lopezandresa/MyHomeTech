import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  create(dto: CreateNotificationDto) {
    const n = this.notifRepo.create(dto);
    return this.notifRepo.save(n);
  }

  findAllForUser(userId: number) {
    return this.notifRepo.find({ where: { userId } });
  }

  markRead(id: number) {
    return this.notifRepo.update(id, { read: true });
  }
}