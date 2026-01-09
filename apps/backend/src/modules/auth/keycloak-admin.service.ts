import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { users, lookups, lookupTypes } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class KeycloakAdminService implements OnModuleInit {
  private readonly logger = new Logger(KeycloakAdminService.name);
  private kcAdminClient: KcAdminClient;
  private isConnected = false;

  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.initializeClient();
    } catch (error) {
      this.logger.error('Failed to initialize Keycloak admin client', error);
    }
  }

  /**
   * Initialize and authenticate Keycloak Admin Client
   */
  private async initializeClient(): Promise<void> {
    try {
      this.kcAdminClient = new KcAdminClient({
        baseUrl: this.configService.get('keycloak.authServerUrl'),
        realmName: this.configService.get('keycloak.realm'),
      });

      // Authenticate with admin credentials
      await this.kcAdminClient.auth({
        username: this.configService.get('keycloak.admin.username'),
        password: this.configService.get('keycloak.admin.password'),
        grantType: 'password',
        clientId: this.configService.get('keycloak.admin.clientId') || 'admin-cli',
      });

      this.isConnected = true;
      this.logger.log('Keycloak Admin Client initialized successfully');

      // Set up token refresh
      setInterval(async () => {
        try {
          await this.kcAdminClient.auth({
            username: this.configService.get('keycloak.admin.username'),
            password: this.configService.get('keycloak.admin.password'),
            grantType: 'password',
            clientId: this.configService.get('keycloak.admin.clientId') || 'admin-cli',
          });
        } catch (error) {
          this.logger.error('Failed to refresh Keycloak admin token', error);
        }
      }, 58 * 1000); // Refresh every 58 seconds
    } catch (error) {
      this.logger.error('Failed to initialize Keycloak Admin Client', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Ensure client is connected, retry if not
   */
  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.initializeClient();
    }
  }

  /**
   * Get user from Keycloak by email
   */
  async getUserByEmail(email: string) {
    await this.ensureConnected();
    try {
      const users = await this.kcAdminClient.users.find({ email, exact: true });
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      this.logger.error(`Failed to get user by email: ${email}`, error);
      throw error;
    }
  }

  /**
   * Get user from Keycloak by ID
   */
  async getUserById(keycloakId: string) {
    await this.ensureConnected();
    try {
      return await this.kcAdminClient.users.findOne({ id: keycloakId });
    } catch (error) {
      this.logger.error(`Failed to get user by ID: ${keycloakId}`, error);
      throw error;
    }
  }

  /**
   * Create user in Keycloak
   */
  async createUser(userData: {
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    enabled?: boolean;
    attributes?: Record<string, string[]>;
  }) {
    await this.ensureConnected();
    try {
      // Check if user already exists
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
    } catch (error) {
      this.logger.error(`Failed to create user: ${userData.email}`, error);
      throw error;
    }
  }

  /**
   * Update user in Keycloak
   */
  async updateUser(keycloakId: string, userData: {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    enabled?: boolean;
    attributes?: Record<string, string[]>;
  }) {
    await this.ensureConnected();
    try {
      await this.kcAdminClient.users.update({ id: keycloakId }, userData);
      this.logger.log(`Updated user in Keycloak: ${keycloakId}`);
      return await this.getUserById(keycloakId);
    } catch (error) {
      this.logger.error(`Failed to update user: ${keycloakId}`, error);
      throw error;
    }
  }

  /**
   * Delete user from Keycloak
   */
  async deleteUser(keycloakId: string) {
    await this.ensureConnected();
    try {
      await this.kcAdminClient.users.del({ id: keycloakId });
      this.logger.log(`Deleted user from Keycloak: ${keycloakId}`);
    } catch (error) {
      this.logger.error(`Failed to delete user: ${keycloakId}`, error);
      throw error;
    }
  }

  /**
   * Sync single user to Keycloak
   */
  async syncUserToKeycloak(userId: number) {
    await this.ensureConnected();
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

      // Get user status and role names
      const [userStatus] = await this.db
        .select({ code: lookups.code })
        .from(lookups)
        .where(eq(lookups.id, user.statusId))
        .limit(1);

      // Check if user exists in Keycloak
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
        // Update existing user
        await this.updateUser(existingUser.id, {
          email: user.email,
          username: user.username,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          enabled: user.isActive && !user.isDeleted,
          attributes,
        });

        // Update keycloakUserId in database if not set
        if (!user.keycloakUserId) {
          await this.db
            .update(users)
            .set({ keycloakUserId: existingUser.id })
            .where(eq(users.id, userId));
        }

        return existingUser;
      } else {
        // Create new user
        const newUser = await this.createUser({
          email: user.email,
          username: user.username,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          enabled: user.isActive && !user.isDeleted,
          attributes,
        });

        // Save keycloakUserId to database
        await this.db
          .update(users)
          .set({ keycloakUserId: newUser.id })
          .where(eq(users.id, userId));

        return newUser;
      }
    } catch (error) {
      this.logger.error(`Failed to sync user to Keycloak: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Sync user from Keycloak to database
   */
  async syncUserFromKeycloak(keycloakId: string) {
    await this.ensureConnected();
    try {
      const kcUser = await this.getUserById(keycloakId);
      if (!kcUser) {
        throw new Error(`Keycloak user not found: ${keycloakId}`);
      }

      // Check if user exists in database
      const [existingUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.keycloakUserId, keycloakId))
        .limit(1);

      // Get status ID from lookups
      const statusCode = kcUser.attributes?.status?.[0] || 'active';
      const [statusLookup] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(
          and(
            eq(lookupTypes.code, 'user_status'),
            eq(lookups.code, statusCode)
          )
        )
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
        // Update existing user
        await this.db
          .update(users)
          .set(userData)
          .where(eq(users.id, existingUser.id));
        return existingUser.id;
      } else {
        // Create new user (without password)
        const [newUser] = await this.db
          .insert(users)
          .values({
            ...userData,
            roleId: 3, // Default user role
            isDeleted: false,
          })
          .returning();
        return newUser.id;
      }
    } catch (error) {
      this.logger.error(`Failed to sync user from Keycloak: ${keycloakId}`, error);
      throw error;
    }
  }

  /**
   * Get or create realm role
   */
  async getOrCreateRole(roleName: string, description?: string) {
    await this.ensureConnected();
    try {
      // Try to get existing role
      try {
        const role = await this.kcAdminClient.roles.findOneByName({ name: roleName });
        if (role) {
          return role;
        }
      } catch (error) {
        // Role doesn't exist, will create it
      }

      // Create new role
      await this.kcAdminClient.roles.create({
        name: roleName,
        description: description || roleName,
      });

      this.logger.log(`Created role in Keycloak: ${roleName}`);
      return await this.kcAdminClient.roles.findOneByName({ name: roleName });
    } catch (error) {
      this.logger.error(`Failed to get or create role: ${roleName}`, error);
      throw error;
    }
  }

  /**
   * Assign roles to user
   */
  async assignRolesToUser(keycloakUserId: string, roleNames: string[]) {
    await this.ensureConnected();
    try {
      // Get all roles
      const roles = await Promise.all(
        roleNames.map(name => this.kcAdminClient.roles.findOneByName({ name }))
      );

      const validRoles = roles.filter(role => role !== null && role !== undefined);

      if (validRoles.length > 0) {
        await this.kcAdminClient.users.addRealmRoleMappings({
          id: keycloakUserId,
          roles: validRoles.map(role => ({ id: role.id, name: role.name })),
        });

        this.logger.log(`Assigned roles to user ${keycloakUserId}: ${roleNames.join(', ')}`);
      }
    } catch (error) {
      this.logger.error(`Failed to assign roles to user: ${keycloakUserId}`, error);
      throw error;
    }
  }

  /**
   * Remove roles from user
   */
  async removeRolesFromUser(keycloakUserId: string, roleNames: string[]) {
    await this.ensureConnected();
    try {
      // Get all roles
      const roles = await Promise.all(
        roleNames.map(name => this.kcAdminClient.roles.findOneByName({ name }))
      );

      const validRoles = roles.filter(role => role !== null && role !== undefined);

      if (validRoles.length > 0) {
        await this.kcAdminClient.users.delRealmRoleMappings({
          id: keycloakUserId,
          roles: validRoles.map(role => ({ id: role.id, name: role.name })),
        });

        this.logger.log(`Removed roles from user ${keycloakUserId}: ${roleNames.join(', ')}`);
      }
    } catch (error) {
      this.logger.error(`Failed to remove roles from user: ${keycloakUserId}`, error);
      throw error;
    }
  }

  /**
   * Get user's roles
   */
  async getUserRoles(keycloakUserId: string) {
    await this.ensureConnected();
    try {
      const roles = await this.kcAdminClient.users.listRealmRoleMappings({
        id: keycloakUserId,
      });
      return roles;
    } catch (error) {
      this.logger.error(`Failed to get user roles: ${keycloakUserId}`, error);
      throw error;
    }
  }

  /**
   * Sync all roles from database to Keycloak
   */
  async syncRolesToKeycloak() {
    await this.ensureConnected();
    try {
      // Get all user roles from database
      const roles = await this.db
        .select({
          code: lookups.code,
          nameEn: lookups.nameEn,
          descriptionEn: lookups.descriptionEn,
        })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(eq(lookupTypes.code, 'user_role'));

      // Create roles in Keycloak
      for (const role of roles) {
        await this.getOrCreateRole(role.code, role.descriptionEn || role.nameEn);
      }

      this.logger.log(`Synced ${roles.length} roles to Keycloak`);
      return roles.length;
    } catch (error) {
      this.logger.error('Failed to sync roles to Keycloak', error);
      throw error;
    }
  }

  /**
   * Sync all permissions from database to Keycloak
   */
  async syncPermissionsToKeycloak() {
    await this.ensureConnected();
    try {
      // Get all permissions from database
      const permissions = await this.db
        .select({
          code: lookups.code,
          nameEn: lookups.nameEn,
          descriptionEn: lookups.descriptionEn,
        })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(eq(lookupTypes.code, 'permission'));

      // Create permission roles in Keycloak
      for (const permission of permissions) {
        await this.getOrCreateRole(
          `permission:${permission.code}`,
          permission.descriptionEn || permission.nameEn
        );
      }

      this.logger.log(`Synced ${permissions.length} permissions to Keycloak`);
      return permissions.length;
    } catch (error) {
      this.logger.error('Failed to sync permissions to Keycloak', error);
      throw error;
    }
  }

  /**
   * Sync user roles (from user_roles table)
   */
  async syncUserRoles(userId: number) {
    await this.ensureConnected();
    try {
      // Get user from database
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user || !user.keycloakUserId) {
        throw new Error(`User not found or not synced to Keycloak: ${userId}`);
      }

      // Get user's role from roleId
      const [userRole] = await this.db
        .select({ code: lookups.code })
        .from(lookups)
        .where(eq(lookups.id, user.roleId))
        .limit(1);

      if (userRole) {
        // Get current roles
        const currentRoles = await this.getUserRoles(user.keycloakUserId);
        const currentRoleNames = currentRoles.map(r => r.name);

        // Get all system roles
        const allSystemRoles = await this.db
          .select({ code: lookups.code })
          .from(lookups)
          .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
          .where(eq(lookupTypes.code, 'user_role'));

        const systemRoleNames = allSystemRoles.map(r => r.code);

        // Remove old system roles
        const rolesToRemove = currentRoleNames.filter(name => 
          systemRoleNames.includes(name) && name !== userRole.code
        );
        if (rolesToRemove.length > 0) {
          await this.removeRolesFromUser(user.keycloakUserId, rolesToRemove);
        }

        // Assign new role
        await this.assignRolesToUser(user.keycloakUserId, [userRole.code]);

        this.logger.log(`Synced roles for user ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to sync user roles: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Batch sync multiple users
   */
  async syncAllUsersToKeycloak(batchSize = 50): Promise<{ success: number; failed: number }> {
    await this.ensureConnected();
    let success = 0;
    let failed = 0;

    try {
      // Get all active users from database
      const allUsers = await this.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.isDeleted, false));

      this.logger.log(`Starting sync of ${allUsers.length} users to Keycloak`);

      // Process in batches
      for (let i = 0; i < allUsers.length; i += batchSize) {
        const batch = allUsers.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(async (user) => {
            try {
              await this.syncUserToKeycloak(user.id);
              success++;
            } catch (error) {
              this.logger.error(`Failed to sync user ${user.id}`, error);
              failed++;
            }
          })
        );

        this.logger.log(`Synced batch ${Math.floor(i / batchSize) + 1}: ${success} success, ${failed} failed`);
      }

      this.logger.log(`Completed sync: ${success} success, ${failed} failed`);
      return { success, failed };
    } catch (error) {
      this.logger.error('Failed to sync all users to Keycloak', error);
      throw error;
    }
  }
}
