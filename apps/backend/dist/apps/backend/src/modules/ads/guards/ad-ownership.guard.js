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
exports.AdOwnershipGuard = void 0;
const common_1 = require("@nestjs/common");
const ads_service_1 = require("../ads.service");
let AdOwnershipGuard = class AdOwnershipGuard {
    adsService;
    constructor(adsService) {
        this.adsService = adsService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const adId = parseInt(request.params.id);
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        if (user.roles?.includes('admin')) {
            return true;
        }
        const ad = await this.adsService.findOne(adId);
        if (ad.createdBy !== user.id) {
            throw new common_1.ForbiddenException('You can only access your own ads');
        }
        return true;
    }
};
exports.AdOwnershipGuard = AdOwnershipGuard;
exports.AdOwnershipGuard = AdOwnershipGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ads_service_1.AdsService])
], AdOwnershipGuard);
//# sourceMappingURL=ad-ownership.guard.js.map