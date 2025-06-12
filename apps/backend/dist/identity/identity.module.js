"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const identity_entity_1 = require("./identity.entity");
const identity_service_1 = require("./identity.service");
const identity_controller_1 = require("./identity.controller");
const passport_1 = require("@nestjs/passport");
let IdentityModule = class IdentityModule {
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([identity_entity_1.Identity]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
        ],
        providers: [identity_service_1.IdentityService],
        controllers: [identity_controller_1.IdentityController],
        exports: [identity_service_1.IdentityService],
    })
], IdentityModule);
//# sourceMappingURL=identity.module.js.map