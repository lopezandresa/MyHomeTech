import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './notification.entity';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    create(dto: CreateNotificationDto): Promise<Notification>;
    findAll(id: number): Promise<Notification[]>;
    markRead(id: number): Promise<import("typeorm").UpdateResult>;
}
