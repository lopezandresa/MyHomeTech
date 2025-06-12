"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRequest = exports.ServiceRequestStatus = void 0;
const typeorm_1 = require("typeorm");
const identity_entity_1 = require("../identity/identity.entity");
const appliance_entity_1 = require("../appliance/appliance.entity");
var ServiceRequestStatus;
(function (ServiceRequestStatus) {
    ServiceRequestStatus["PENDING"] = "pending";
    ServiceRequestStatus["OFFERED"] = "offered";
    ServiceRequestStatus["ACCEPTED"] = "accepted";
    ServiceRequestStatus["SCHEDULED"] = "scheduled";
    ServiceRequestStatus["IN_PROGRESS"] = "in_progress";
    ServiceRequestStatus["COMPLETED"] = "completed";
    ServiceRequestStatus["CANCELLED"] = "cancelled";
})(ServiceRequestStatus || (exports.ServiceRequestStatus = ServiceRequestStatus = {}));
let ServiceRequest = class ServiceRequest {
    id;
    client;
    clientId;
    appliance;
    applianceId;
    description;
    clientPrice;
    technicianPrice;
    status;
    createdAt;
    expiresAt;
    technician;
    technicianId;
    acceptedAt;
    scheduledAt;
    completedAt;
    cancelledAt;
};
exports.ServiceRequest = ServiceRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => identity_entity_1.Identity, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'clientId' }),
    __metadata("design:type", identity_entity_1.Identity)
], ServiceRequest.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appliance_entity_1.Appliance, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'applianceId' }),
    __metadata("design:type", appliance_entity_1.Appliance)
], ServiceRequest.prototype, "appliance", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "applianceId", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], ServiceRequest.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "clientPrice", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "technicianPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ServiceRequestStatus,
        default: ServiceRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], ServiceRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ServiceRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ServiceRequest.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => identity_entity_1.Identity, { nullable: true, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'technicianId' }),
    __metadata("design:type", identity_entity_1.Identity)
], ServiceRequest.prototype, "technician", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "technicianId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ServiceRequest.prototype, "acceptedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ServiceRequest.prototype, "scheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ServiceRequest.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ServiceRequest.prototype, "cancelledAt", void 0);
exports.ServiceRequest = ServiceRequest = __decorate([
    (0, typeorm_1.Entity)()
], ServiceRequest);
//# sourceMappingURL=service-request.entity.js.map