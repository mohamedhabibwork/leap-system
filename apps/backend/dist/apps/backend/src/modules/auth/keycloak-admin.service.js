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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var KeycloakAdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeycloakAdminService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const keycloak_admin_client_1 = __importDefault(require("@keycloak/keycloak-admin-client"));
const database_module_1 = require("../../database/database.module");
const database_1 = require("@leap-lms/database");
const drizzle_orm_1 = require("drizzle-orm");
let KeycloakAdminService = KeycloakAdminService_1 = class KeycloakAdminService {
    db;
    configService;
    logger = new common_1.Logger(KeycloakAdminService_1.name);
    kcAdminClient;
    isConnected = false;
    constructor(db, configService) {
        this.db = db;
        this.configService = configService;
    }
    async onModuleInit() {
        try {
            await this.initializeClient();
        }
        catch (error) {
            this.logger.error('Failed to initialize Keycloak admin client', error);
        }
    }
    async initializeClient() {
        try {
            this.kcAdminClient = new keycloak_admin_client_1.default({
                baseUrl: this.configService.get('keycloak.authServerUrl'),
                realmName: this.configService.get('keycloak.realm'),
            });
            await this.kcAdminClient.auth({
                username: this.configService.get('keycloak.admin.username'),
                password: this.configService.get('keycloak.admin.password'),
                grantType: 'password',
                clientId: this.configService.get('keycloak.admin.clientId') || 'admin-cli',
            });
            this.isConnected = true;
            this.logger.log('Keycloak Admin Client initialized successfully');
            setInterval(async () => {
                try {
                    await this.kcAdminClient.auth({
                        username: this.configService.get('keycloak.admin.username'),
                        password: this.configService.get('keycloak.admin.password'),
                        grantType: 'password',
                        clientId: this.configService.get('keycloak.admin.clientId') || 'admin-cli',
                    });
                }
                catch (error) {
                    this.logger.error('Failed to refresh Keycloak admin token', error);
                }
            }, 58 * 1000);
        }
        catch (error) {
            this.logger.error('Failed to initialize Keycloak Admin Client', error);
            this.isConnected = false;
            throw error;
        }
    }
    async ensureConnected() {
        if (!this.isConnected) {
            await this.initializeClient();
        }
    }
    async getUserByEmail(email) {
        await this.ensureConnected();
        try {
            const users = await this.kcAdminClient.users.find({ email, exact: true });
            return users.length > 0 ? users[0] : null;
        }
        catch (error) {
            this.logger.error(`Failed to get user by email: ${email}`, error);
            throw error;
        }
    }
    async getUserById(keycloakId) {
        await this.ensureConnected();
        try {
            return await this.kcAdminClient.users.findOne({ id: keycloakId });
        }
        catch (error) {
            this.logger.error(`Failed to get user by ID: ${keycloakId}`, error);
            throw error;
        }
    }
    async createUser(userData) {
        await this.ensureConnected();
        try {
            const existingUser = await this.getUserByEmail(userData.email);
            if (existingUser) {
                this.logger.warn(`User already exists in Keycloak: ${userData.email}`);
                return existingUser;
            }
            const userId = await this.kcAdminClient.users.create({
                username: userData.username,
                email: userData.email,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                enabled: userData.enabled !== undefined ? userData.enabled : true,
                emailVerified: false,
                attributes: userData.attributes || {},
            });
            this.logger.log(`Created user in Keycloak: ${userData.email}`);
            return await this.getUserById(userId.id);
        }
        catch (error) {
            this.logger.error(`Failed to create user: ${userData.email}`, error);
            throw error;
        }
    }
    async updateUser(keycloakId, userData) {
        await this.ensureConnected();
        try {
            await this.kcAdminClient.users.update({ id: keycloakId }, userData);
            this.logger.log(`Updated user in Keycloak: ${keycloakId}`);
            return await this.getUserById(keycloakId);
        }
        catch (error) {
            this.logger.error(`Failed to update user: ${keycloakId}`, error);
            throw error;
        }
    }
    async deleteUser(keycloakId) {
        await this.ensureConnected();
        try {
            await this.kcAdminClient.users.del({ id: keycloakId });
            this.logger.log(`Deleted user from Keycloak: ${keycloakId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete user: ${keycloakId}`, error);
            throw error;
        }
    }
    async syncUserToKeycloak(userId) {
        await this.ensureConnected();
        try {
            const [user] = await this.db
                .select()
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.id, userId))
                .limit(1);
            if (!user) {
                throw new Error(`User not found: ${userId}`);
            }
            const [userStatus] = await this.db
                .select({ code: database_1.lookups.code })
                .from(database_1.lookups)
                .where((0, drizzle_orm_1.eq)(database_1.lookups.id, user.statusId))
                .limit(1);
            const existingUser = await this.getUserByEmail(user.email);
            const attributes = {
                phone: user.phone ? [user.phone] : [],
                avatar: user.avatarUrl ? [user.avatarUrl] : [],
                locale: user.preferredLanguage ? [user.preferredLanguage] : ['en'],
                timezone: user.timezone ? [user.timezone] : ['UTC'],
                status: userStatus ? [userStatus.code] : ['active'],
                dbUserId: [user.id.toString()],
            };
            if (existingUser) {
                await this.updateUser(existingUser.id, {
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    enabled: user.isActive && !user.isDeleted,
                    attributes,
                });
                if (!user.keycloakUserId) {
                    await this.db
                        .update(database_1.users)
                        .set({ keycloakUserId: existingUser.id })
                        .where((0, drizzle_orm_1.eq)(database_1.users.id, userId));
                }
                return existingUser;
            }
            else {
                const newUser = await this.createUser({
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    enabled: user.isActive && !user.isDeleted,
                    attributes,
                });
                await this.db
                    .update(database_1.users)
                    .set({ keycloakUserId: newUser.id })
                    .where((0, drizzle_orm_1.eq)(database_1.users.id, userId));
                return newUser;
            }
        }
        catch (error) {
            this.logger.error(`Failed to sync user to Keycloak: ${userId}`, error);
            throw error;
        }
    }
    async syncUserFromKeycloak(keycloakId) {
        await this.ensureConnected();
        try {
            const kcUser = await this.getUserById(keycloakId);
            if (!kcUser) {
                throw new Error(`Keycloak user not found: ${keycloakId}`);
            }
            const [existingUser] = await this.db
                .select()
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.keycloakUserId, keycloakId))
                .limit(1);
            const statusCode = kcUser.attributes?.status?.[0] || 'active';
            const [statusLookup] = await this.db
                .select({ id: database_1.lookups.id })
                .from(database_1.lookups)
                .innerJoin(database_1.lookupTypes, (0, drizzle_orm_1.eq)(database_1.lookups.lookupTypeId, database_1.lookupTypes.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.lookupTypes.code, 'user_status'), (0, drizzle_orm_1.eq)(database_1.lookups.code, statusCode)))
                .limit(1);
            const userData = {
                email: kcUser.email,
                username: kcUser.username,
                firstName: kcUser.firstName || null,
                lastName: kcUser.lastName || null,
                phone: kcUser.attributes?.phone?.[0] || null,
                avatarUrl: kcUser.attributes?.avatar?.[0] || null,
                preferredLanguage: kcUser.attributes?.locale?.[0] || 'en',
                timezone: kcUser.attributes?.timezone?.[0] || 'UTC',
                isActive: kcUser.enabled !== false,
                keycloakUserId: keycloakId,
                statusId: statusLookup?.id || 1,
            };
            if (existingUser) {
                await this.db
                    .update(database_1.users)
                    .set(userData)
                    .where((0, drizzle_orm_1.eq)(database_1.users.id, existingUser.id));
                return existingUser.id;
            }
            else {
                const [newUser] = await this.db
                    .insert(database_1.users)
                    .values({
                    ...userData,
                    roleId: 3,
                    isDeleted: false,
                })
                    .returning();
                return newUser.id;
            }
        }
        catch (error) {
            this.logger.error(`Failed to sync user from Keycloak: ${keycloakId}`, error);
            throw error;
        }
    }
    async getOrCreateRole(roleName, description) {
        await this.ensureConnected();
        try {
            try {
                const role = await this.kcAdminClient.roles.findOneByName({ name: roleName });
                if (role) {
                    return role;
                }
            }
            catch (error) {
            }
            await this.kcAdminClient.roles.create({
                name: roleName,
                description: description || roleName,
            });
            this.logger.log(`Created role in Keycloak: ${roleName}`);
            return await this.kcAdminClient.roles.findOneByName({ name: roleName });
        }
        catch (error) {
            this.logger.error(`Failed to get or create role: ${roleName}`, error);
            throw error;
        }
    }
    async assignRolesToUser(keycloakUserId, roleNames) {
        await this.ensureConnected();
        try {
            const roles = await Promise.all(roleNames.map(name => this.kcAdminClient.roles.findOneByName({ name })));
            const validRoles = roles.filter(role => role !== null && role !== undefined);
            if (validRoles.length > 0) {
                await this.kcAdminClient.users.addRealmRoleMappings({
                    id: keycloakUserId,
                    roles: validRoles.map(role => ({ id: role.id, name: role.name })),
                });
                this.logger.log(`Assigned roles to user ${keycloakUserId}: ${roleNames.join(', ')}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to assign roles to user: ${keycloakUserId}`, error);
            throw error;
        }
    }
    async removeRolesFromUser(keycloakUserId, roleNames) {
        await this.ensureConnected();
        try {
            const roles = await Promise.all(roleNames.map(name => this.kcAdminClient.roles.findOneByName({ name })));
            const validRoles = roles.filter(role => role !== null && role !== undefined);
            if (validRoles.length > 0) {
                await this.kcAdminClient.users.delRealmRoleMappings({
                    id: keycloakUserId,
                    roles: validRoles.map(role => ({ id: role.id, name: role.name })),
                });
                this.logger.log(`Removed roles from user ${keycloakUserId}: ${roleNames.join(', ')}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to remove roles from user: ${keycloakUserId}`, error);
            throw error;
        }
    }
    async getUserRoles(keycloakUserId) {
        await this.ensureConnected();
        try {
            const roles = await this.kcAdminClient.users.listRealmRoleMappings({
                id: keycloakUserId,
            });
            return roles;
        }
        catch (error) {
            this.logger.error(`Failed to get user roles: ${keycloakUserId}`, error);
            throw error;
        }
    }
    async syncRolesToKeycloak() {
        await this.ensureConnected();
        try {
            const roles = await this.db
                .select({
                code: database_1.lookups.code,
                nameEn: database_1.lookups.nameEn,
                descriptionEn: database_1.lookups.descriptionEn,
            })
                .from(database_1.lookups)
                .innerJoin(database_1.lookupTypes, (0, drizzle_orm_1.eq)(database_1.lookups.lookupTypeId, database_1.lookupTypes.id))
                .where((0, drizzle_orm_1.eq)(database_1.lookupTypes.code, 'user_role'));
            for (const role of roles) {
                await this.getOrCreateRole(role.code, role.descriptionEn || role.nameEn);
            }
            this.logger.log(`Synced ${roles.length} roles to Keycloak`);
            return roles.length;
        }
        catch (error) {
            this.logger.error('Failed to sync roles to Keycloak', error);
            throw error;
        }
    }
    async syncPermissionsToKeycloak() {
        await this.ensureConnected();
        try {
            const permissions = await this.db
                .select({
                code: database_1.lookups.code,
                nameEn: database_1.lookups.nameEn,
                descriptionEn: database_1.lookups.descriptionEn,
            })
                .from(database_1.lookups)
                .innerJoin(database_1.lookupTypes, (0, drizzle_orm_1.eq)(database_1.lookups.lookupTypeId, database_1.lookupTypes.id))
                .where((0, drizzle_orm_1.eq)(database_1.lookupTypes.code, 'permission'));
            for (const permission of permissions) {
                await this.getOrCreateRole(`permission:${permission.code}`, permission.descriptionEn || permission.nameEn);
            }
            this.logger.log(`Synced ${permissions.length} permissions to Keycloak`);
            return permissions.length;
        }
        catch (error) {
            this.logger.error('Failed to sync permissions to Keycloak', error);
            throw error;
        }
    }
    async syncUserRoles(userId) {
        await this.ensureConnected();
        try {
            const [user] = await this.db
                .select()
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.id, userId))
                .limit(1);
            if (!user || !user.keycloakUserId) {
                throw new Error(`User not found or not synced to Keycloak: ${userId}`);
            }
            const [userRole] = await this.db
                .select({ code: database_1.lookups.code })
                .from(database_1.lookups)
                .where((0, drizzle_orm_1.eq)(database_1.lookups.id, user.roleId))
                .limit(1);
            if (userRole) {
                const currentRoles = await this.getUserRoles(user.keycloakUserId);
                const currentRoleNames = currentRoles.map(r => r.name);
                const allSystemRoles = await this.db
                    .select({ code: database_1.lookups.code })
                    .from(database_1.lookups)
                    .innerJoin(database_1.lookupTypes, (0, drizzle_orm_1.eq)(database_1.lookups.lookupTypeId, database_1.lookupTypes.id))
                    .where((0, drizzle_orm_1.eq)(database_1.lookupTypes.code, 'user_role'));
                const systemRoleNames = allSystemRoles.map(r => r.code);
                const rolesToRemove = currentRoleNames.filter(name => systemRoleNames.includes(name) && name !== userRole.code);
                if (rolesToRemove.length > 0) {
                    await this.removeRolesFromUser(user.keycloakUserId, rolesToRemove);
                }
                await this.assignRolesToUser(user.keycloakUserId, [userRole.code]);
                this.logger.log(`Synced roles for user ${userId}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to sync user roles: ${userId}`, error);
            throw error;
        }
    }
    async syncAllUsersToKeycloak(batchSize = 50) {
        await this.ensureConnected();
        let success = 0;
        let failed = 0;
        try {
            const allUsers = await this.db
                .select({ id: database_1.users.id })
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.isDeleted, false));
            this.logger.log(`Starting sync of ${allUsers.length} users to Keycloak`);
            for (let i = 0; i < allUsers.length; i += batchSize) {
                const batch = allUsers.slice(i, i + batchSize);
                await Promise.allSettled(batch.map(async (user) => {
                    try {
                        await this.syncUserToKeycloak(user.id);
                        success++;
                    }
                    catch (error) {
                        this.logger.error(`Failed to sync user ${user.id}`, error);
                        failed++;
                    }
                }));
                this.logger.log(`Synced batch ${Math.floor(i / batchSize) + 1}: ${success} success, ${failed} failed`);
            }
            this.logger.log(`Completed sync: ${success} success, ${failed} failed`);
            return { success, failed };
        }
        catch (error) {
            this.logger.error('Failed to sync all users to Keycloak', error);
            throw error;
        }
    }
};
exports.KeycloakAdminService = KeycloakAdminService;
exports.KeycloakAdminService = KeycloakAdminService = KeycloakAdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], KeycloakAdminService);
//# sourceMappingURL=keycloak-admin.service.js.map