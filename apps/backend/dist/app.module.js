"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const technician_module_1 = require("./technician/technician.module");
const client_module_1 = require("./client/client.module");
const service_request_module_1 = require("./service-request/service-request.module");
const rating_module_1 = require("./rating/rating.module");
const notification_module_1 = require("./notification/notification.module");
const identity_module_1 = require("./identity/identity.module");
const appliance_module_1 = require("./appliance/appliance.module");
const config_1 = require("@nestjs/config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST'),
                    port: parseInt(config.get('DB_PORT', '5432'), 10),
                    username: config.get('DB_USER'),
                    password: config.get('DB_PASS'),
                    database: config.get('DB_NAME'),
                    synchronize: true,
                    autoLoadEntities: true
                }),
            }),
            auth_module_1.AuthModule,
            technician_module_1.TechnicianModule,
            client_module_1.ClientModule,
            service_request_module_1.ServiceRequestModule,
            rating_module_1.RatingModule,
            notification_module_1.NotificationModule,
            identity_module_1.IdentityModule,
            appliance_module_1.ApplianceModule
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map