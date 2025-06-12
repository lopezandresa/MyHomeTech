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
exports.RatingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rating_entity_1 = require("./rating.entity");
const service_request_entity_1 = require("../service-request/service-request.entity");
let RatingService = class RatingService {
    ratingRepo;
    srRepo;
    constructor(ratingRepo, srRepo) {
        this.ratingRepo = ratingRepo;
        this.srRepo = srRepo;
    }
    async create(dto) {
        const exists = await this.ratingRepo.findOne({ where: { serviceRequestId: dto.serviceRequestId } });
        if (exists) {
            throw new Error('Ya existe una calificación para esta solicitud');
        }
        const sr = await this.srRepo.findOne({ where: { id: dto.serviceRequestId, status: service_request_entity_1.ServiceRequestStatus.COMPLETED } });
        if (!sr) {
            throw new Error('Solo se puede calificar un servicio finalizado');
        }
        const r = this.ratingRepo.create(dto);
        return this.ratingRepo.save(r);
    }
    findAll() {
        return this.ratingRepo.find();
    }
    findByUser(id) {
        return this.ratingRepo.find({ where: { ratedId: id } });
    }
};
exports.RatingService = RatingService;
exports.RatingService = RatingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rating_entity_1.Rating)),
    __param(1, (0, typeorm_1.InjectRepository)(service_request_entity_1.ServiceRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RatingService);
//# sourceMappingURL=rating.service.js.map