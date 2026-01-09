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
var KeycloakSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeycloakSyncService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const keycloak_admin_service_1 = require("./keycloak-admin.service");
let KeycloakSyncService = KeycloakSyncService_1 = class KeycloakSyncService {
    keycloakAdminService;
    configService;
    logger = new common_1.Logger(KeycloakSyncService_1.name);
    syncEnabled;
    syncOnCreate;
    syncOnUpdate;
    constructor(keycloakAdminService, configService) {
        this.keycloakAdminService = keycloakAdminService;
        this.configService = configService;
        this.syncEnabled = this.configService.get('keycloak.sync.enabled', false);
        this.syncOnCreate = this.configService.get('keycloak.sync.onCreate', true);
        this.syncOnUpdate = this.configService.get('keycloak.sync.onUpdate', true);
        this.logger.log(`Keycloak sync initialized - Enabled: ${this.syncEnabled}, onCreate: ${this.syncOnCreate}, onUpdate: ${this.syncOnUpdate}`);
    }
    isSyncEnabled() {
        return this.syncEnabled;
    }
    async syncUserToKeycloakOnCreate(userId) {
        if (!this.isSyncEnabled() || !this.syncOnCreate) {
            this.logger.debug(`Sync on create disabled for user ${userId}`);
            return;
        }
        try {
            await this.keycloakAdminService.syncUserToKeycloak(userId);
            this.logger.log(`Successfully synced new user ${userId} to Keycloak`);
        }
        catch (error) {
            this.logger.error(`Failed to sync new user ${userId} to Keycloak`, error);
        }
    }
    async syncUserToKeycloakOnUpdate(userId) {
        if (!this.isSyncEnabled() || !this.syncOnUpdate) {
            this.logger.debug(`Sync on update disabled for user ${userId}`);
            return;
        }
        try {
            await this.keycloakAdminService.syncUserToKeycloak(userId);
            this.logger.log(`Successfully synced updated user ${userId} to Keycloak`);
        }
        catch (error) {
            this.logger.error(`Failed to sync updated user ${userId} to Keycloak`, error);
        }
    }
    async syncUserRolesToKeycloak(userId) {
        if (!this.isSyncEnabled()) {
            this.logger.debug(`Sync disabled for user roles ${userId}`);
            return;
        }
        try {
            await this.keycloakAdminService.syncUserRoles(userId);
            this.logger.log(`Successfully synced roles for user ${userId} to Keycloak`);
        }
        catch (error) {
            this.logger.error(`Failed to sync roles for user ${userId} to Keycloak`, error);
        }
    }
    async deleteUserFromKeycloak(keycloakUserId) {
        if (!this.isSyncEnabled()) {
            this.logger.debug(`Sync disabled, skipping deletion for Keycloak user ${keycloakUserId}`);
            return;
        }
        try {
            await this.keycloakAdminService.deleteUser(keycloakUserId);
            this.logger.log(`Successfully deleted user ${keycloakUserId} from Keycloak`);
        }
        catch (error) {
            this.logger.error(`Failed to delete user ${keycloakUserId} from Keycloak`, error);
        }
    }
    async manualSyncUser(userId) {
        try {
            await this.keycloakAdminService.syncUserToKeycloak(userId);
            await this.keycloakAdminService.syncUserRoles(userId);
            return {
                success: true,
                message: `User ${userId} synced successfully to Keycloak`,
            };
        }
        catch (error) {
            this.logger.error(`Manual sync failed for user ${userId}`, error);
            return {
                success: false,
                message: `Failed to sync user ${userId}: ${error.message}`,
            };
        }
    }
    async manualSyncAllUsers() {
        try {
            const result = await this.keycloakAdminService.syncAllUsersToKeycloak();
            return {
                ...result,
                message: `Synced ${result.success} users successfully, ${result.failed} failed`,
            };
        }
        catch (error) {
            this.logger.error('Manual sync all users failed', error);
            return {
                success: 0,
                failed: 0,
                message: `Failed to sync users: ${error.message}`,
            };
        }
    }
    async syncRolesToKeycloak() {
        try {
            const count = await this.keycloakAdminService.syncRolesToKeycloak();
            return {
                success: true,
                count,
                message: `Synced ${count} roles to Keycloak`,
            };
        }
        catch (error) {
            this.logger.error('Failed to sync roles to Keycloak', error);
            return {
                success: false,
                message: `Failed to sync roles: ${error.message}`,
            };
        }
    }
    async syncPermissionsToKeycloak() {
        try {
            const count = await this.keycloakAdminService.syncPermissionsToKeycloak();
            return {
                success: true,
                count,
                message: `Synced ${count} permissions to Keycloak`,
            };
        }
        catch (error) {
            this.logger.error('Failed to sync permissions to Keycloak', error);
            return {
                success: false,
                message: `Failed to sync permissions: ${error.message}`,
            };
        }
    }
    async getUserSyncStatus(userId) {
        try {
            const { keycloakAdminService } = this;
            return {
                synced: false,
                message: 'Sync status check not yet implemented',
            };
        }
        catch (error) {
            return {
                synced: false,
                message: `Error checking sync status: ${error.message}`,
            };
        }
    }
    enableSync() {
        this.syncEnabled = true;
        this.logger.log('Keycloak sync enabled');
    }
    disableSync() {
        this.syncEnabled = false;
        this.logger.log('Keycloak sync disabled');
    }
    getSyncConfig() {
        return {
            enabled: this.syncEnabled,
            syncOnCreate: this.syncOnCreate,
            syncOnUpdate: this.syncOnUpdate,
        };
    }
};
exports.KeycloakSyncService = KeycloakSyncService;
exports.KeycloakSyncService = KeycloakSyncService = KeycloakSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [keycloak_admin_service_1.KeycloakAdminService,
        config_1.ConfigService])
], KeycloakSyncService);
//# sourceMappingURL=keycloak-sync.service.js.map