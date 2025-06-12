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
exports.ServiceRequestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/jwt/jwt.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/roles.decorator");
const service_request_service_1 = require("./service-request.service");
const create_service_request_dto_1 = require("./dto/create-service-request.dto");
const offer_price_dto_1 = require("./dto/offer-price.dto");
const accept_request_dto_1 = require("./dto/accept-request.dto");
const schedule_request_dto_1 = require("./dto/schedule-request.dto");
let ServiceRequestController = class ServiceRequestController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    create(req, dto) {
        return this.svc.create(req.user.id, dto);
    }
    findPending() {
        return this.svc.findPending();
    }
    offer(req, id, dto) {
        return this.svc.offerPrice(id, req.user.id, dto);
    }
    accept(req, id, dto) {
        return this.svc.accept(id, req.user.id, dto);
    }
    schedule(req, id, dto) {
        return this.svc.schedule(id, req.user.id, dto);
    }
    async acceptAndSchedule(req, id) {
        return this.svc.acceptByTechnician(id, req.user.id);
    }
    findById(id) {
        return this.svc.findById(id);
    }
    findByClient(clientId) {
        return this.svc.findByClient(clientId);
    }
    findByTechnician(techId) {
        return this.svc.findByTechnician(techId);
    }
    async complete(req, id) {
        return this.svc.completeByClient(id, req.user.id);
    }
    async reject(req, id) {
        return this.svc.rejectByTechnician(id, req.user.id);
    }
};
exports.ServiceRequestController = ServiceRequestController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('client'),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cliente crea una nueva solicitud' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_service_request_dto_1.CreateServiceRequestDto]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('technician'),
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Técnico lista solicitudes pendientes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "findPending", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('technician'),
    (0, common_1.Post)(':id/offer'),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiOperation)({ summary: 'Técnico realiza contraoferta' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, offer_price_dto_1.OfferPriceDto]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "offer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('client'),
    (0, common_1.Post)(':id/accept'),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiOperation)({ summary: 'Cliente acepta la solicitud' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, accept_request_dto_1.AcceptRequestDto]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "accept", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('technician'),
    (0, common_1.Post)(':id/schedule'),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiOperation)({ summary: 'Técnico agenda la solicitud aceptada' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, schedule_request_dto_1.ScheduleRequestDto]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "schedule", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('technician'),
    (0, common_1.Post)(':id/accept-and-schedule'),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID de la solicitud' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Técnico acepta la solicitud y la agenda automáticamente',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "acceptAndSchedule", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtiene detalles de una solicitud' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "findById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('client'),
    (0, common_1.Get)('client/:clientId'),
    (0, swagger_1.ApiParam)({ name: 'clientId', type: Number }),
    (0, swagger_1.ApiOperation)({ summary: 'Cliente ve su historial de solicitudes' }),
    __param(0, (0, common_1.Param)('clientId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "findByClient", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('technician'),
    (0, common_1.Get)('technician/:techId'),
    (0, swagger_1.ApiParam)({ name: 'techId', type: Number }),
    (0, swagger_1.ApiOperation)({ summary: 'Técnico ve sus solicitudes asignadas' }),
    __param(0, (0, common_1.Param)('techId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "findByTechnician", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('client'),
    (0, common_1.Post)(':id/complete'),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiOperation)({ summary: 'Cliente marca la solicitud como finalizada' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "complete", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('technician'),
    (0, common_1.Post)(':id/reject'),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiOperation)({ summary: 'Técnico rechaza la solicitud' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "reject", null);
exports.ServiceRequestController = ServiceRequestController = __decorate([
    (0, swagger_1.ApiTags)('service-requests'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('service-requests'),
    __metadata("design:paramtypes", [service_request_service_1.ServiceRequestService])
], ServiceRequestController);
//# sourceMappingURL=service-request.controller.js.map