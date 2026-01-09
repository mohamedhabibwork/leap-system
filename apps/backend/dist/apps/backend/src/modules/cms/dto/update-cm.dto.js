"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCmDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_cm_dto_1 = require("./create-cm.dto");
class UpdateCmDto extends (0, swagger_1.PartialType)(create_cm_dto_1.CreateCmDto) {
}
exports.UpdateCmDto = UpdateCmDto;
//# sourceMappingURL=update-cm.dto.js.map