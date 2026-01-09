"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdPermissionGuard = void 0;
const common_1 = require("@nestjs/common");
let AdPermissionGuard = class AdPermissionGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        if (user.roles?.includes('admin')) {
            return true;
        }
        if (user.subscriptionStatus === 'active' || user.roles?.includes('instructor')) {
            return true;
        }
        throw new common_1.ForbiddenException('You need an active subscription to create ads');
    }
};
exports.AdPermissionGuard = AdPermissionGuard;
exports.AdPermissionGuard = AdPermissionGuard = __decorate([
    (0, common_1.Injectable)()
], AdPermissionGuard);
//# sourceMappingURL=ad-permission.guard.js.map