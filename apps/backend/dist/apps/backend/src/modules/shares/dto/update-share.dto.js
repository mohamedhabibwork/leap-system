"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateShareDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_share_dto_1 = require("./create-share.dto");
class UpdateShareDto extends (0, swagger_1.PartialType)(create_share_dto_1.CreateShareDto) {
}
exports.UpdateShareDto = UpdateShareDto;
//# sourceMappingURL=update-share.dto.js.map