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
exports.ApplianceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appliance_entity_1 = require("./appliance.entity");
let ApplianceService = class ApplianceService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    create(dto) {
        const a = this.repo.create(dto);
        return this.repo.save(a);
    }
    findAll() {
        return this.repo.find();
    }
    async update(id, dto) {
        const appliance = await this.repo.preload({ id, ...dto });
        if (!appliance) {
            throw new common_1.NotFoundException(`Appliance with id ${id} not found`);
        }
        return this.repo.save(appliance);
    }
    async remove(id) {
        const result = await this.repo.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Appliance with id ${id} not found`);
        }
    }
    async findById(id) {
        const appliance = await this.repo.findOne({ where: { id } });
        if (!appliance)
            throw new common_1.NotFoundException(`Appliance with id ${id} not found`);
        return appliance;
    }
    async findByName(name) {
        return this.repo.find({
            where: { name: (0, typeorm_2.ILike)(`%${name}%`) },
        });
    }
};
exports.ApplianceService = ApplianceService;
exports.ApplianceService = ApplianceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appliance_entity_1.Appliance)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ApplianceService);
//# sourceMappingURL=appliance.service.js.map