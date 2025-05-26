import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  create(data: Partial<Notification>) {
    return this.repo.save(data);
  }

  findAllForUser(userId: number) {
    return this.repo.find({ where: { userId } });
  }

  markRead(id: number) {
    return this.repo.update(id, { read: true });
  }
}