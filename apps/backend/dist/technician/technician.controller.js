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
exports.TechnicianController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const technician_service_1 = require("./technician.service");
const create_technician_profile_dto_1 = require("./dto/create-technician-profile.dto");
const jwt_guard_1 = require("../auth/jwt/jwt.guard");
let TechnicianController = class TechnicianController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    createProfile(dto, req) {
        return this.svc.createProfile(dto);
    }
    findAll() {
        return this.svc.findAll();
    }
    findById(id) {
        return this.svc.findById(id);
    }
};
exports.TechnicianController = TechnicianController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-jwt'),
    (0, common_1.Post)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Completa o actualiza perfil de técnico' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_technician_profile_dto_1.CreateTechnicianProfileDto, Object]),
    __metadata("design:returntype", Promise)
], TechnicianController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listado de técnicos y sus especialidades' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TechnicianController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalle de un técnico' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TechnicianController.prototype, "findById", null);
exports.TechnicianController = TechnicianController = __decorate([
    (0, swagger_1.ApiTags)('technicians'),
    (0, common_1.Controller)('technicians'),
    __metadata("design:paramtypes", [technician_service_1.TechnicianService])
], TechnicianController);
//# sourceMappingURL=technician.controller.js.map