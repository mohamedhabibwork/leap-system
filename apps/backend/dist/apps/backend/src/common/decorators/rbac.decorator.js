"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permissions = exports.Roles = exports.PERMISSIONS_KEY = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
exports.PERMISSIONS_KEY = 'permissions';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
const Permissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.Permissions = Permissions;
//# sourceMappingURL=rbac.decorator.js.map