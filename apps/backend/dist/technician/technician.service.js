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
exports.TechnicianService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const technician_entity_1 = require("./technician.entity");
const typeorm_2 = require("typeorm");
const appliance_entity_1 = require("../appliance/appliance.entity");
let TechnicianService = class TechnicianService {
    techRepo;
    appRepo;
    constructor(techRepo, appRepo) {
        this.techRepo = techRepo;
        this.appRepo = appRepo;
    }
    async createProfile(dto) {
        const apps = await this.appRepo.find({
            where: { id: (0, typeorm_2.In)(dto.appliances) }
        });
        const tech = this.techRepo.create({
            identityId: dto.identityId,
            cedula: dto.cedula,
            birthDate: new Date(dto.birthDate),
            experienceYears: dto.experienceYears,
            idPhotoUrl: dto.idPhotoUrl,
            appliances: apps,
        });
        return this.techRepo.save(tech);
    }
    findAll() {
        return this.techRepo.find();
    }
    findById(id) {
        return this.techRepo.findOne({ where: { id } });
    }
    async updateProfileByIdentityId(identityId, profile) {
        const tech = await this.techRepo.findOne({ where: { identityId } });
        if (!tech)
            throw new Error('Perfil de técnico no encontrado');
        Object.assign(tech, profile);
        return this.techRepo.save(tech);
    }
};
exports.TechnicianService = TechnicianService;
exports.TechnicianService = TechnicianService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(technician_entity_1.Technician)),
    __param(1, (0, typeorm_1.InjectRepository)(appliance_entity_1.Appliance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TechnicianService);
//# sourceMappingURL=technician.service.js.map