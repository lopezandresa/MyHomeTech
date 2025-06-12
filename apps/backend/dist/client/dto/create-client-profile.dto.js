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
exports.CreateClientProfileDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateClientProfileDto {
    identityId;
    fullName;
    cedula;
    birthDate;
    phone;
}
exports.CreateClientProfileDto = CreateClientProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la identidad (Identity)' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateClientProfileDto.prototype, "identityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre completo del cliente' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateClientProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cédula única', example: '12345678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreateClientProfileDto.prototype, "cedula", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha de nacimiento (YYYY-MM-DD)' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateClientProfileDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Número de teléfono', example: '+57 3001234567' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(7),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], CreateClientProfileDto.prototype, "phone", void 0);
//# sourceMappingURL=create-client-profile.dto.js.map