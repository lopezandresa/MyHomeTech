"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateApplianceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_appliance_dto_1 = require("./create-appliance.dto");
class UpdateApplianceDto extends (0, swagger_1.PartialType)(create_appliance_dto_1.CreateApplianceDto) {
}
exports.UpdateApplianceDto = UpdateApplianceDto;
//# sourceMappingURL=update-appliance.dto.js.map