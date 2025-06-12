import { Identity } from '../identity/identity.entity';
import { Appliance } from '../appliance/appliance.entity';
export declare enum ServiceRequestStatus {
    PENDING = "pending",
    OFFERED = "offered",
    ACCEPTED = "accepted",
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class ServiceRequest {
    id: number;
    client: Identity;
    clientId: number;
    appliance: Appliance;
    applianceId: number;
    description: string;
    clientPrice: number;
    technicianPrice?: number;
    status: ServiceRequestStatus;
    createdAt: Date;
    expiresAt?: Date;
    technician?: Identity;
    technicianId?: number;
    acceptedAt?: Date;
    scheduledAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
}
