import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeycloakAdminService } from './keycloak-admin.service';

@Injectable()
export class KeycloakSyncService {
  private readonly logger = new Logger(KeycloakSyncService.name);
  private syncEnabled: boolean;
  private syncOnCreate: boolean;
  private syncOnUpdate: boolean;

  constructor(
    private keycloakAdminService: KeycloakAdminService,
    private configService: ConfigService,
  ) {
    this.syncEnabled = this.configService.get('keycloak.sync.enabled', false);
    this.syncOnCreate = this.configService.get('keycloak.sync.onCreate', true);
    this.syncOnUpdate = this.configService.get('keycloak.sync.onUpdate', true);

    this.logger.log(`Keycloak sync initialized - Enabled: ${this.syncEnabled}, onCreate: ${this.syncOnCreate}, onUpdate: ${this.syncOnUpdate}`);
  }

  /**
   * Check if sync is enabled
   */
  private isSyncEnabled(): boolean {
    return this.syncEnabled;
  }

  /**
   * Sync user to Keycloak after creation
   */
  async syncUserToKeycloakOnCreate(userId: number): Promise<void> {
    if (!this.isSyncEnabled() || !this.syncOnCreate) {
      this.logger.debug(`Sync on create disabled for user ${userId}`);
      return;
    }

    try {
      await this.keycloakAdminService.syncUserToKeycloak(userId);
      this.logger.log(`Successfully synced new user ${userId} to Keycloak`);
    } catch (error) {
      this.logger.error(`Failed to sync new user ${userId} to Keycloak`, error);
      // Don't throw error to prevent registration failure
    }
  }

  /**
   * Sync user to Keycloak after update
   */
  async syncUserToKeycloakOnUpdate(userId: number): Promise<void> {
    if (!this.isSyncEnabled() || !this.syncOnUpdate) {
      this.logger.debug(`Sync on update disabled for user ${userId}`);
      return;
    }

    try {
      await this.keycloakAdminService.syncUserToKeycloak(userId);
      this.logger.log(`Successfully synced updated user ${userId} to Keycloak`);
    } catch (error) {
      this.logger.error(`Failed to sync updated user ${userId} to Keycloak`, error);
      // Don't throw error to prevent update failure
    }
  }

  /**
   * Sync user roles to Keycloak
   */
  async syncUserRolesToKeycloak(userId: number): Promise<void> {
    if (!this.isSyncEnabled()) {
      this.logger.debug(`Sync disabled for user roles ${userId}`);
      return;
    }

    try {
      await this.keycloakAdminService.syncUserRoles(userId);
      this.logger.log(`Successfully synced roles for user ${userId} to Keycloak`);
    } catch (error) {
      this.logger.error(`Failed to sync roles for user ${userId} to Keycloak`, error);
      // Don't throw error
    }
  }

  /**
   * Delete user from Keycloak
   */
  async deleteUserFromKeycloak(keycloakUserId: string): Promise<void> {
    if (!this.isSyncEnabled()) {
      this.logger.debug(`Sync disabled, skipping deletion for Keycloak user ${keycloakUserId}`);
      return;
    }

    try {
      await this.keycloakAdminService.deleteUser(keycloakUserId);
      this.logger.log(`Successfully deleted user ${keycloakUserId} from Keycloak`);
    } catch (error) {
      this.logger.error(`Failed to delete user ${keycloakUserId} from Keycloak`, error);
      // Don't throw error
    }
  }

  /**
   * Manually trigger sync for a single user
   */
  async manualSyncUser(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      await this.keycloakAdminService.syncUserToKeycloak(userId);
      await this.keycloakAdminService.syncUserRoles(userId);
      return {
        success: true,
        message: `User ${userId} synced successfully to Keycloak`,
      };
    } catch (error) {
      this.logger.error(`Manual sync failed for user ${userId}`, error);
      return {
        success: false,
        message: `Failed to sync user ${userId}: ${error.message}`,
      };
    }
  }

  /**
   * Manually trigger sync for all users
   */
  async manualSyncAllUsers(): Promise<{ success: number; failed: number; message: string }> {
    try {
      const result = await this.keycloakAdminService.syncAllUsersToKeycloak();
      return {
        ...result,
        message: `Synced ${result.success} users successfully, ${result.failed} failed`,
      };
    } catch (error) {
      this.logger.error('Manual sync all users failed', error);
      return {
        success: 0,
        failed: 0,
        message: `Failed to sync users: ${error.message}`,
      };
    }
  }

  /**
   * Sync all roles to Keycloak
   */
  async syncRolesToKeycloak(): Promise<{ success: boolean; count?: number; message: string }> {
    try {
      const count = await this.keycloakAdminService.syncRolesToKeycloak();
      return {
        success: true,
        count,
        message: `Synced ${count} roles to Keycloak`,
      };
    } catch (error) {
      this.logger.error('Failed to sync roles to Keycloak', error);
      return {
        success: false,
        message: `Failed to sync roles: ${error.message}`,
      };
    }
  }

  /**
   * Sync all permissions to Keycloak
   */
  async syncPermissionsToKeycloak(): Promise<{ success: boolean; count?: number; message: string }> {
    try {
      const count = await this.keycloakAdminService.syncPermissionsToKeycloak();
      return {
        success: true,
        count,
        message: `Synced ${count} permissions to Keycloak`,
      };
    } catch (error) {
      this.logger.error('Failed to sync permissions to Keycloak', error);
      return {
        success: false,
        message: `Failed to sync permissions: ${error.message}`,
      };
    }
  }

  /**
   * Get sync status for a user
   */
  async getUserSyncStatus(userId: number): Promise<{
    synced: boolean;
    keycloakUserId?: string;
    message: string;
  }> {
    try {
      const { keycloakAdminService } = this;
      // This would need to query the database for the user's keycloakUserId
      // For now, return basic info
      return {
        synced: false,
        message: 'Sync status check not yet implemented',
      };
    } catch (error) {
      return {
        synced: false,
        message: `Error checking sync status: ${error.message}`,
      };
    }
  }

  /**
   * Enable sync
   */
  enableSync(): void {
    this.syncEnabled = true;
    this.logger.log('Keycloak sync enabled');
  }

  /**
   * Disable sync
   */
  disableSync(): void {
    this.syncEnabled = false;
    this.logger.log('Keycloak sync disabled');
  }

  /**
   * Get sync configuration
   */
  getSyncConfig(): {
    enabled: boolean;
    syncOnCreate: boolean;
    syncOnUpdate: boolean;
  } {
    return {
      enabled: this.syncEnabled,
      syncOnCreate: this.syncOnCreate,
      syncOnUpdate: this.syncOnUpdate,
    };
  }
}
