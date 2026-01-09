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
var RbacService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@leap-lms/database");
const drizzle_orm_1 = require("drizzle-orm");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let RbacService = RbacService_1 = class RbacService {
    db;
    logger = new common_1.Logger(RbacService_1.name);
    constructor(db) {
        this.db = db;
    }
    async getUserRoles(userId) {
        try {
            const result = await this.db
                .select({
                roleName: database_1.lookups.nameEn,
            })
                .from(database_1.userRoles)
                .innerJoin(database_1.lookups, (0, drizzle_orm_1.eq)(database_1.userRoles.roleId, database_1.lookups.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.userRoles.userId, userId), (0, drizzle_orm_1.eq)(database_1.userRoles.isActive, true)));
            return result.map(r => r.roleName?.toLowerCase() || '');
        }
        catch (error) {
            this.logger.error(`Error getting user roles for user ${userId}:`, error);
            return [];
        }
    }
    async getUserPermissions(userId) {
        try {
            const userRoleRecords = await this.db
                .select({ roleId: database_1.userRoles.roleId })
                .from(database_1.userRoles)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.userRoles.userId, userId), (0, drizzle_orm_1.eq)(database_1.userRoles.isActive, true)));
            if (userRoleRecords.length === 0) {
                return [];
            }
            const roleIds = userRoleRecords.map(r => r.roleId);
            const result = await this.db
                .select({
                permissionName: database_1.lookups.nameEn,
            })
                .from(database_1.rolePermissions)
                .innerJoin(database_1.lookups, (0, drizzle_orm_1.eq)(database_1.rolePermissions.permissionId, database_1.lookups.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(database_1.rolePermissions.roleId, roleIds), (0, drizzle_orm_1.eq)(database_1.rolePermissions.isGranted, true)));
            return [...new Set(result.map(r => r.permissionName?.toLowerCase() || ''))];
        }
        catch (error) {
            this.logger.error(`Error getting user permissions for user ${userId}:`, error);
            return [];
        }
    }
    async hasRole(userId, roleName) {
        const roles = await this.getUserRoles(userId);
        return roles.includes(roleName.toLowerCase());
    }
    async hasAnyRole(userId, roleNames) {
        const roles = await this.getUserRoles(userId);
        return roleNames.some(role => roles.includes(role.toLowerCase()));
    }
    async hasAllRoles(userId, roleNames) {
        const roles = await this.getUserRoles(userId);
        return roleNames.every(role => roles.includes(role.toLowerCase()));
    }
    async hasPermission(userId, permissionName) {
        const permissions = await this.getUserPermissions(userId);
        return permissions.includes(permissionName.toLowerCase());
    }
    async hasAnyPermission(userId, permissionNames) {
        const permissions = await this.getUserPermissions(userId);
        return permissionNames.some(perm => permissions.includes(perm.toLowerCase()));
    }
    async hasAllPermissions(userId, permissionNames) {
        const permissions = await this.getUserPermissions(userId);
        return permissionNames.every(perm => permissions.includes(perm.toLowerCase()));
    }
    async assignRole(userId, roleId, assignedBy) {
        try {
            const existing = await this.db
                .select()
                .from(database_1.userRoles)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.userRoles.userId, userId), (0, drizzle_orm_1.eq)(database_1.userRoles.roleId, roleId)))
                .limit(1);
            if (existing.length > 0) {
                await this.db
                    .update(database_1.userRoles)
                    .set({ isActive: true, updatedAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(database_1.userRoles.id, existing[0].id));
            }
            else {
                await this.db.insert(database_1.userRoles).values({
                    userId,
                    roleId,
                    assignedBy,
                    isActive: true,
                });
            }
            this.logger.log(`Assigned role ${roleId} to user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Error assigning role ${roleId} to user ${userId}:`, error);
            throw error;
        }
    }
    async revokeRole(userId, roleId) {
        try {
            await this.db
                .update(database_1.userRoles)
                .set({ isActive: false, updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.userRoles.userId, userId), (0, drizzle_orm_1.eq)(database_1.userRoles.roleId, roleId)));
            this.logger.log(`Revoked role ${roleId} from user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Error revoking role ${roleId} from user ${userId}:`, error);
            throw error;
        }
    }
    async assignPermissionToRole(roleId, permissionId) {
        try {
            const existing = await this.db
                .select()
                .from(database_1.rolePermissions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.rolePermissions.roleId, roleId), (0, drizzle_orm_1.eq)(database_1.rolePermissions.permissionId, permissionId)))
                .limit(1);
            if (existing.length > 0) {
                await this.db
                    .update(database_1.rolePermissions)
                    .set({ isGranted: true, updatedAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(database_1.rolePermissions.id, existing[0].id));
            }
            else {
                await this.db.insert(database_1.rolePermissions).values({
                    roleId,
                    permissionId,
                    isGranted: true,
                });
            }
            this.logger.log(`Assigned permission ${permissionId} to role ${roleId}`);
        }
        catch (error) {
            this.logger.error(`Error assigning permission ${permissionId} to role ${roleId}:`, error);
            throw error;
        }
    }
    async revokePermissionFromRole(roleId, permissionId) {
        try {
            await this.db
                .update(database_1.rolePermissions)
                .set({ isGranted: false, updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.rolePermissions.roleId, roleId), (0, drizzle_orm_1.eq)(database_1.rolePermissions.permissionId, permissionId)));
            this.logger.log(`Revoked permission ${permissionId} from role ${roleId}`);
        }
        catch (error) {
            this.logger.error(`Error revoking permission ${permissionId} from role ${roleId}:`, error);
            throw error;
        }
    }
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = RbacService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], RbacService);
//# sourceMappingURL=rbac.service.js.map