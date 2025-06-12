"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplianceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const appliance_entity_1 = require("./appliance.entity");
const appliance_service_1 = require("./appliance.service");
const appliance_controller_1 = require("./appliance.controller");
let ApplianceModule = class ApplianceModule {
};
exports.ApplianceModule = ApplianceModule;
exports.ApplianceModule = ApplianceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([appliance_entity_1.Appliance])
        ],
        providers: [
            appliance_service_1.ApplianceService
        ],
        controllers: [
            appliance_controller_1.ApplianceController
        ],
        exports: [
            appliance_service_1.ApplianceService
        ]
    })
], ApplianceModule);
//# sourceMappingURL=appliance.module.js.map