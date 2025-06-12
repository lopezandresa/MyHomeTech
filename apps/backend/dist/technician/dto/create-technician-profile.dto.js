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
exports.CreateTechnicianProfileDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateTechnicianProfileDto {
    identityId;
    cedula;
    birthDate;
    experienceYears;
    idPhotoUrl;
    appliances;
}
exports.CreateTechnicianProfileDto = CreateTechnicianProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la identidad (Identity)' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTechnicianProfileDto.prototype, "identityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTechnicianProfileDto.prototype, "cedula", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha de nacimiento (ISO)' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTechnicianProfileDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTechnicianProfileDto.prototype, "experienceYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL de la foto de la cédula' }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateTechnicianProfileDto.prototype, "idPhotoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lista de IDs de electrodomésticos especializados',
        type: [Number]
    }),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ArrayUnique)(),
    __metadata("design:type", Array)
], CreateTechnicianProfileDto.prototype, "appliances", void 0);
//# sourceMappingURL=create-technician-profile.dto.js.map