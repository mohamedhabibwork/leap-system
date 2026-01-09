"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEnrollmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_enrollment_dto_1 = require("./create-enrollment.dto");
class UpdateEnrollmentDto extends (0, swagger_1.PartialType)(create_enrollment_dto_1.CreateEnrollmentDto) {
}
exports.UpdateEnrollmentDto = UpdateEnrollmentDto;
//# sourceMappingURL=update-enrollment.dto.js.map