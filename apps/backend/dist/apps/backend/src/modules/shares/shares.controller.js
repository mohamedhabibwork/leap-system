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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharesController = void 0;
const common_1 = require("@nestjs/common");
const shares_service_1 = require("./shares.service");
const create_share_dto_1 = require("./dto/create-share.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SharesController = class SharesController {
    sharesService;
    constructor(sharesService) {
        this.sharesService = sharesService;
    }
    create(user, dto) {
        return this.sharesService.create(user.userId, dto);
    }
    findMy(user) {
        return this.sharesService.findByUser(user.userId);
    }
    findByShareable(type, id) {
        return this.sharesService.findByShareable(type, id);
    }
};
exports.SharesController = SharesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_share_dto_1.CreateShareDto]),
    __metadata("design:returntype", void 0)
], SharesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-shares'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SharesController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)('by-shareable'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], SharesController.prototype, "findByShareable", null);
exports.SharesController = SharesController = __decorate([
    (0, swagger_1.ApiTags)('shares'),
    (0, common_1.Controller)('shares'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [shares_service_1.SharesService])
], SharesController);
//# sourceMappingURL=shares.controller.js.map