import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationService {
    private readonly notifRepo;
    constructor(notifRepo: Repository<Notification>);
    create(dto: CreateNotificationDto): Promise<Notification>;
    findAllForUser(userId: number): Promise<Notification[]>;
    markRead(id: number): Promise<import("typeorm").UpdateResult>;
}
