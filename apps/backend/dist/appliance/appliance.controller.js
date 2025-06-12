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
exports.ApplianceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const appliance_service_1 = require("./appliance.service");
const create_appliance_dto_1 = require("./dto/create-appliance.dto");
const jwt_guard_1 = require("../auth/jwt/jwt.guard");
const roles_decorator_1 = require("../common/roles.decorator");
const update_appliance_dto_1 = require("./dto/update-appliance.dto");
let ApplianceController = class ApplianceController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    create(dto) {
        return this.svc.create(dto);
    }
    async update(id, dto) {
        return this.svc.update(id, dto);
    }
    async remove(id) {
        return this.svc.remove(id);
    }
    findAll() {
        return this.svc.findAll();
    }
    async findById(id) {
        return this.svc.findById(id);
    }
    async findByName(name) {
        return this.svc.findByName(name);
    }
};
exports.ApplianceController = ApplianceController;
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Crea un electrodoméstico' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_appliance_dto_1.CreateApplianceDto]),
    __metadata("design:returntype", Promise)
], ApplianceController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualiza un electrodoméstico existente' }),
    (0, common_1.Post)('update/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_appliance_dto_1.UpdateApplianceDto]),
    __metadata("design:returntype", Promise)
], ApplianceController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Elimina un electrodoméstico por ID' }),
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ApplianceController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista todos los electrodomésticos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApplianceController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtiene un electrodoméstico por ID' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ApplianceController.prototype, "findById", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtiene un electrodoméstico por nombre (contains)' }),
    (0, common_1.Get)('search/:name'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplianceController.prototype, "findByName", null);
exports.ApplianceController = ApplianceController = __decorate([
    (0, swagger_1.ApiTags)('appliances'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('appliances'),
    __metadata("design:paramtypes", [appliance_service_1.ApplianceService])
], ApplianceController);
//# sourceMappingURL=appliance.controller.js.map