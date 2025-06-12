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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRequestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_request_entity_1 = require("./service-request.entity");
let ServiceRequestService = class ServiceRequestService {
    srRepo;
    constructor(srRepo) {
        this.srRepo = srRepo;
    }
    async create(clientId, dto) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + dto.validMinutes * 60000);
        const req = this.srRepo.create({
            clientId,
            applianceId: dto.applianceId,
            description: dto.description,
            clientPrice: dto.clientPrice,
            expiresAt,
            status: service_request_entity_1.ServiceRequestStatus.PENDING,
        });
        return this.srRepo.save(req);
    }
    async findPending() {
        return this.srRepo.find({
            where: {
                status: service_request_entity_1.ServiceRequestStatus.PENDING,
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
        });
    }
    async offerPrice(id, technicianId, dto) {
        const req = await this.srRepo.findOne({ where: { id, status: service_request_entity_1.ServiceRequestStatus.PENDING } });
        if (!req)
            throw new common_1.NotFoundException('Solicitud no disponible para oferta');
        req.technicianId = technicianId;
        req.technicianPrice = dto.technicianPrice;
        req.status = service_request_entity_1.ServiceRequestStatus.OFFERED;
        return this.srRepo.save(req);
    }
    async accept(id, clientId, dto) {
        const req = await this.srRepo.findOne({
            where: [
                { id, clientId, status: service_request_entity_1.ServiceRequestStatus.PENDING },
                { id, clientId, status: service_request_entity_1.ServiceRequestStatus.OFFERED },
            ],
        });
        if (!req)
            throw new common_1.NotFoundException('Solicitud no disponible para aceptar');
        req.status = service_request_entity_1.ServiceRequestStatus.ACCEPTED;
        req.acceptedAt = new Date();
        return this.srRepo.save(req);
    }
    async schedule(id, technicianId, dto) {
        const req = await this.srRepo.findOne({
            where: {
                id,
                technicianId,
                status: service_request_entity_1.ServiceRequestStatus.ACCEPTED,
            },
        });
        if (!req)
            throw new common_1.NotFoundException('Solicitud no disponible para agendar');
        req.scheduledAt = new Date(dto.scheduledAt);
        req.status = service_request_entity_1.ServiceRequestStatus.SCHEDULED;
        return this.srRepo.save(req);
    }
    async acceptByTechnician(id, technicianId) {
        const req = await this.srRepo.findOne({
            where: { id, status: service_request_entity_1.ServiceRequestStatus.PENDING },
        });
        if (!req) {
            throw new common_1.NotFoundException('Solicitud no disponible para aceptar');
        }
        req.technicianId = technicianId;
        req.acceptedAt = new Date();
        req.scheduledAt = new Date();
        req.status = service_request_entity_1.ServiceRequestStatus.SCHEDULED;
        return this.srRepo.save(req);
    }
    async completeByClient(id, clientId) {
        const req = await this.srRepo.findOne({
            where: [
                { id, clientId, status: service_request_entity_1.ServiceRequestStatus.SCHEDULED },
                { id, clientId, status: service_request_entity_1.ServiceRequestStatus.IN_PROGRESS },
            ],
        });
        if (!req)
            throw new common_1.NotFoundException('No se puede finalizar esta solicitud');
        req.status = service_request_entity_1.ServiceRequestStatus.COMPLETED;
        req.completedAt = new Date();
        return this.srRepo.save(req);
    }
    async rejectByTechnician(id, technicianId) {
        const req = await this.srRepo.findOne({
            where: { id, status: service_request_entity_1.ServiceRequestStatus.PENDING },
        });
        if (!req) {
            throw new common_1.NotFoundException('Solicitud no disponible para rechazar');
        }
        req.technicianId = technicianId;
        req.status = service_request_entity_1.ServiceRequestStatus.CANCELLED;
        req.cancelledAt = new Date();
        return this.srRepo.save(req);
    }
    async findById(id) {
        return this.srRepo.findOne({ where: { id } });
    }
    async findByClient(clientId) {
        return this.srRepo.find({ where: { clientId } });
    }
    async findByTechnician(technicianId) {
        return this.srRepo.find({ where: { technicianId } });
    }
};
exports.ServiceRequestService = ServiceRequestService;
exports.ServiceRequestService = ServiceRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_request_entity_1.ServiceRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ServiceRequestService);
//# sourceMappingURL=service-request.service.js.map