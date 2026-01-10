import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeycloakAdminService } from './keycloak-admin.service';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { users } from '@leap-lms/database';
import { eq } from 'drizzle-orm';

/**
 * KeycloakSyncService
 * 
 * Handles bi-directional synchronization between the database and Keycloak.
 * Keycloak is treated as the source of truth for user data during login.
 */
@Injectable()
export class KeycloakSyncService {
  private readonly logger = new Logger(KeycloakSyncService.name);
  private syncEnabled: boolean;
  private syncOnCreate: boolean;
  private syncOnUpdate: boolean;

  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
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

  /**
   * Sync user FROM Keycloak TO Database (Keycloak as source of truth)
   * This is called during login to ensure DB has latest data from Keycloak
   */
  async syncUserFromKeycloak(keycloakUser: any, keycloakId: string): Promise<any> {
    if (!this.isSyncEnabled()) {
      this.logger.debug('Sync disabled, skipping sync from Keycloak');
      return null;
    }

    try {
      // Find existing user by email or keycloakUserId
      const [existingUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.email, keycloakUser.email))
        .limit(1);

      const userData = {
        email: keycloakUser.email,
        username: keycloakUser.preferred_username || keycloakUser.email.split('@')[0],
        firstName: keycloakUser.given_name || '',
        lastName: keycloakUser.family_name || '',
        keycloakUserId: keycloakId,
        emailVerifiedAt: keycloakUser.email_verified ? new Date() : null,
        isActive: true,
        isDeleted: false,
      };

      if (existingUser) {
        // Update existing user with Keycloak data (Keycloak is source of truth)
        const [updatedUser] = await this.db
          .update(users)
          .set({
            ...userData,
            // Preserve certain DB-only fields
            roleId: existingUser.roleId,
            statusId: existingUser.statusId,
            passwordHash: existingUser.passwordHash,
            bio: existingUser.bio,
            avatarUrl: existingUser.avatarUrl,
            resumeUrl: existingUser.resumeUrl,
            preferredLanguage: existingUser.preferredLanguage,
            timezone: existingUser.timezone,
            phone: existingUser.phone,
          })
          .where(eq(users.id, existingUser.id))
          .returning();

        this.logger.log(`Synced user from Keycloak: ${keycloakUser.email} (updated existing user)`);
        return updatedUser;
      } else {
        // Create new user from Keycloak data
        const [newUser] = await this.db
          .insert(users)
          .values({
            ...userData,
            roleId: 3, // Default user role
            statusId: 1, // Active status
            preferredLanguage: 'en',
          })
          .returning();

        this.logger.log(`Synced user from Keycloak: ${keycloakUser.email} (created new user)`);
        return newUser;
      }
    } catch (error) {
      this.logger.error(`Failed to sync user from Keycloak: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Sync user TO Keycloak FROM Database
   * This is called when user updates profile in the app
   */
  async syncUserToKeycloak(userId: number): Promise<void> {
    if (!this.isSyncEnabled()) {
      this.logger.debug('Sync disabled, skipping sync to Keycloak');
      return;
    }

    try {
      // Get user from database
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Sync to Keycloak
      await this.keycloakAdminService.syncUserToKeycloak(userId);
      
      this.logger.log(`Synced user to Keycloak: ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to sync user to Keycloak: ${error.message}`, error);
      // Don't throw - allow operation to continue even if Keycloak sync fails
    }
  }

  /**
   * Resolve conflicts between Keycloak and Database
   * Keycloak is always treated as source of truth for login data
   */
  async resolveConflicts(keycloakUser: any, dbUser: any): Promise<any> {
    try {
      // During login, Keycloak data takes precedence
      const updates: any = {};

      // Compare and update fields where Keycloak differs
      if (keycloakUser.email && keycloakUser.email !== dbUser.email) {
        updates.email = keycloakUser.email;
        this.logger.debug(`Email conflict resolved: ${dbUser.email} -> ${keycloakUser.email}`);
      }

      if (keycloakUser.preferred_username && keycloakUser.preferred_username !== dbUser.username) {
        updates.username = keycloakUser.preferred_username;
        this.logger.debug(`Username conflict resolved: ${dbUser.username} -> ${keycloakUser.preferred_username}`);
      }

      if (keycloakUser.given_name && keycloakUser.given_name !== dbUser.firstName) {
        updates.firstName = keycloakUser.given_name;
      }

      if (keycloakUser.family_name && keycloakUser.family_name !== dbUser.lastName) {
        updates.lastName = keycloakUser.family_name;
      }

      if (keycloakUser.email_verified && !dbUser.emailVerifiedAt) {
        updates.emailVerifiedAt = new Date();
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        const [updatedUser] = await this.db
          .update(users)
          .set(updates)
          .where(eq(users.id, dbUser.id))
          .returning();

        this.logger.log(`Resolved conflicts for user ${dbUser.id}: ${Object.keys(updates).join(', ')}`);
        return updatedUser;
      }

      return dbUser;
    } catch (error) {
      this.logger.error(`Failed to resolve conflicts: ${error.message}`, error);
      return dbUser; // Return original on error
    }
  }

  /**
   * Full bi-directional sync for a user
   * Syncs from Keycloak to DB (priority), then from DB to Keycloak
   */
  async fullUserSync(userId: number, keycloakUser?: any): Promise<void> {
    if (!this.isSyncEnabled()) {
      this.logger.debug('Sync disabled, skipping full sync');
      return;
    }

    try {
      // If Keycloak user data provided, sync from Keycloak first
      if (keycloakUser) {
        await this.syncUserFromKeycloak(keycloakUser, keycloakUser.sub);
      }

      // Then sync to Keycloak (updates roles, status, etc.)
      await this.syncUserToKeycloak(userId);

      // Sync roles
      await this.syncUserRolesToKeycloak(userId);

      this.logger.log(`Full sync completed for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to perform full sync: ${error.message}`, error);
      // Don't throw - partial sync is acceptable
    }
  }
}
