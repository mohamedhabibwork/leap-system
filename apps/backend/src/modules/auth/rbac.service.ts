import { Injectable, Logger, Inject } from '@nestjs/common';
import { userRoles, rolePermissions, lookups } from '@leap-lms/database';
import { eq, and, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Get all roles assigned to a user
   */
  async getUserRoles(userId: number): Promise<string[]> {
    try {
      const result = await this.db
        .select({
          roleName: lookups.nameEn,
        })
        .from(userRoles)
        .innerJoin(lookups, eq(userRoles.roleId, lookups.id))
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(userRoles.isActive, true)
          )
        );

      return result.map(r => r.roleName?.toLowerCase() || '');
    } catch (error) {
      this.logger.error(`Error getting user roles for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get all permissions for a user (flattened from all their roles)
   */
  async getUserPermissions(userId: number): Promise<string[]> {
    try {
      // Get user's role IDs
      const userRoleRecords = await this.db
        .select({ roleId: userRoles.roleId })
        .from(userRoles)
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(userRoles.isActive, true)
          )
        );

      if (userRoleRecords.length === 0) {
        return [];
      }

      const roleIds = userRoleRecords.map(r => r.roleId);

      // Get permissions for those roles
      const result = await this.db
        .select({
          permissionName: lookups.nameEn,
        })
        .from(rolePermissions)
        .innerJoin(lookups, eq(rolePermissions.permissionId, lookups.id))
        .where(
          and(
            inArray(rolePermissions.roleId, roleIds),
            eq(rolePermissions.isGranted, true)
          )
        );

      return [...new Set(result.map(r => r.permissionName?.toLowerCase() || ''))];
    } catch (error) {
      this.logger.error(`Error getting user permissions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(userId: number, roleName: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.includes(roleName.toLowerCase());
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(userId: number, roleNames: string[]): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roleNames.some(role => roles.includes(role.toLowerCase()));
  }

  /**
   * Check if user has all of the specified roles
   */
  async hasAllRoles(userId: number, roleNames: string[]): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roleNames.every(role => roles.includes(role.toLowerCase()));
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(userId: number, permissionName: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permissionName.toLowerCase());
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId: number, permissionNames: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissionNames.some(perm => permissions.includes(perm.toLowerCase()));
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(userId: number, permissionNames: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissionNames.every(perm => permissions.includes(perm.toLowerCase()));
  }

  /**
   * Assign a role to a user
   */
  async assignRole(userId: number, roleId: number, assignedBy?: number): Promise<void> {
    try {
      // Check if role already assigned
      const existing = await this.db
        .select()
        .from(userRoles)
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(userRoles.roleId, roleId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update to active if exists
        await this.db
          .update(userRoles)
          .set({ isActive: true, updatedAt: new Date() } as any)
          .where(eq(userRoles.id, existing[0].id));
      } else {
        // Insert new role assignment
        await this.db.insert(userRoles).values({
          userId,
          roleId,
          assignedBy,
          isActive: true,
        } as any);
      }

      this.logger.log(`Assigned role ${roleId} to user ${userId}`);
    } catch (error) {
      this.logger.error(`Error assigning role ${roleId} to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Revoke a role from a user
   */
  async revokeRole(userId: number, roleId: number): Promise<void> {
    try {
      await this.db
        .update(userRoles)
        .set({ isActive: false, updatedAt: new Date() } as any)
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(userRoles.roleId, roleId)
          )
        );

      this.logger.log(`Revoked role ${roleId} from user ${userId}`);
    } catch (error) {
      this.logger.error(`Error revoking role ${roleId} from user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Assign a permission to a role
   */
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    try {
      // Check if permission already assigned
      const existing = await this.db
        .select()
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            eq(rolePermissions.permissionId, permissionId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update to granted if exists
        await this.db
          .update(rolePermissions)
          .set({ isGranted: true, updatedAt: new Date() } as any)
          .where(eq(rolePermissions.id, existing[0].id));
      } else {
        // Insert new permission
        await this.db.insert(rolePermissions).values({
          roleId,
          permissionId,
          isGranted: true,
        } as any);
      }

      this.logger.log(`Assigned permission ${permissionId} to role ${roleId}`);
    } catch (error) {
      this.logger.error(`Error assigning permission ${permissionId} to role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Revoke a permission from a role
   */
  async revokePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    try {
      await this.db
        .update(rolePermissions)
        .set({ isGranted: false, updatedAt: new Date() } as any)
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            eq(rolePermissions.permissionId, permissionId)
          )
        );

      this.logger.log(`Revoked permission ${permissionId} from role ${roleId}`);
    } catch (error) {
      this.logger.error(`Error revoking permission ${permissionId} from role ${roleId}:`, error);
      throw error;
    }
  }
}
