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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateIdentityDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateIdentityDto {
    name;
    email;
    password;
    role;
}
exports.CreateIdentityDto = CreateIdentityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre completo del usuario' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdentityDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email único del usuario' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateIdentityDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Contraseña, mínimo 6 caracteres' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], CreateIdentityDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rol del usuario', enum: ['client', 'technician', 'admin'], default: 'client' }),
    (0, class_validator_1.IsIn)(['client', 'technician', 'admin']),
    __metadata("design:type", String)
], CreateIdentityDto.prototype, "role", void 0);
//# sourceMappingURL=create-identity.dto.js.map