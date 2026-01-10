import { Injectable, Logger } from '@nestjs/common';
import { Role, isSuperAdmin, isAdmin } from '../enums/roles.enum';

/**
 * Service for verifying resource ownership and access permissions
 * Centralizes ownership logic across the application
 */
@Injectable()
export class OwnershipService {
  private readonly logger = new Logger(OwnershipService.name);

  /**
   * Check if user can access a specific resource
   * @param userId - Current user ID
   * @param userRole - Current user role
   * @param resourceType - Type of resource (course, post, enrollment, etc.)
   * @param resourceId - ID of the specific resource
   * @param ownerId - ID of the resource owner (if known)
   * @returns Promise<boolean> - true if user has access
   */
  async canAccess(
    userId: number,
    userRole: Role | string,
    resourceType: string,
    resourceId: number,
    ownerId?: number,
  ): Promise<boolean> {
    // Super admin always has access
    if (isSuperAdmin(userRole)) {
      this.logger.debug(
        `Super admin ${userId} granted access to ${resourceType}:${resourceId}`
      );
      return true;
    }

    // Admin has broad access to most resources
    if (isAdmin(userRole)) {
      const adminCanAccess = this.adminCanAccessResource(resourceType);
      if (adminCanAccess) {
        this.logger.debug(
          `Admin ${userId} granted access to ${resourceType}:${resourceId}`
        );
        return true;
      }
    }

    // If ownerId is provided, use it for quick check
    if (ownerId !== undefined && ownerId !== null) {
      const isOwner = userId === ownerId;
      this.logger.debug(
        `Ownership check for user ${userId} on ${resourceType}:${resourceId} - ` +
        `Owner: ${ownerId}, IsOwner: ${isOwner}`
      );
      return isOwner;
    }

    // Otherwise, check based on resource type and role
    return this.checkResourceAccess(userId, userRole, resourceType, resourceId);
  }

  /**
   * Check if a user is the owner of a resource
   * @param userId - User ID to check
   * @param resourceType - Type of resource
   * @param resourceId - ID of resource
   * @returns Promise<boolean> - true if user is owner
   */
  async isOwner(
    userId: number,
    resourceType: string,
    resourceId: number,
  ): Promise<boolean> {
    // This method should be implemented by calling appropriate service methods
    // based on resourceType
    
    this.logger.warn(
      `isOwner called for ${resourceType}:${resourceId} by user ${userId} - ` +
      'This should be implemented by calling the appropriate service'
    );

    // For now, return false to be safe
    // In production, this should call the appropriate service to check ownership
    return false;
  }

  /**
   * Determine if admin can access a specific resource type
   * @param resourceType - Type of resource
   * @returns boolean - true if admin can access
   */
  private adminCanAccessResource(resourceType: string): boolean {
    // Admin can access most resources for management purposes
    const adminAccessibleResources = [
      'user',
      'course',
      'enrollment',
      'post',
      'group',
      'page',
      'event',
      'job',
      'ticket',
      'report',
      'cms',
      'media',
      'audit',
      'subscription',
      'payment',
    ];

    return adminAccessibleResources.includes(resourceType);
  }

  /**
   * Check resource access based on type and role
   * This method contains the business logic for different resource types
   */
  private async checkResourceAccess(
    userId: number,
    userRole: Role | string,
    resourceType: string,
    resourceId: number,
  ): Promise<boolean> {
    // Resource-specific access logic
    switch (resourceType) {
      case 'course':
        // Instructors can access their own courses
        // This should call courseService.isInstructor(userId, resourceId)
        return userRole === Role.INSTRUCTOR;

      case 'enrollment':
        // Students can access their own enrollments
        // Instructors can access enrollments in their courses
        return userRole === Role.STUDENT || userRole === Role.INSTRUCTOR;

      case 'assignment':
      case 'submission':
        // Students can access their own assignments/submissions
        // Instructors can access submissions for their courses
        return userRole === Role.STUDENT || userRole === Role.INSTRUCTOR;

      case 'post':
      case 'comment':
        // Users can access their own posts/comments
        return true; // Basic check, should verify ownership

      case 'profile':
        // Users can only access their own profile
        return true; // Should verify userId matches profileUserId

      case 'payment':
      case 'invoice':
      case 'subscription':
        // Users can only access their own financial data
        return true; // Should verify ownership

      case 'notification':
        // Users can only access their own notifications
        return true; // Should verify ownership

      default:
        this.logger.warn(
          `Unknown resource type "${resourceType}" in ownership check, denying access`
        );
        return false;
    }
  }

  /**
   * Check if user can perform a specific action on a resource
   * @param userId - User ID
   * @param userRole - User role
   * @param action - Action to perform (read, update, delete)
   * @param resourceType - Type of resource
   * @param resourceId - ID of resource
   * @returns Promise<boolean> - true if action is allowed
   */
  async canPerformAction(
    userId: number,
    userRole: Role | string,
    action: 'read' | 'update' | 'delete' | 'create',
    resourceType: string,
    resourceId?: number,
  ): Promise<boolean> {
    // Super admin can perform any action
    if (isSuperAdmin(userRole)) {
      return true;
    }

    // Admin can perform most actions
    if (isAdmin(userRole)) {
      // Admin cannot delete super admin or modify super admin resources
      // This should be checked if we have the resource owner info
      return true;
    }

    // For create actions, check if user has permission to create this resource type
    if (action === 'create') {
      return this.canCreateResource(userRole, resourceType);
    }

    // For other actions, check access to the specific resource
    if (resourceId !== undefined) {
      const hasAccess = await this.canAccess(
        userId,
        userRole,
        resourceType,
        resourceId,
      );

      if (!hasAccess) {
        return false;
      }

      // Check if the action is allowed on this resource type
      return this.isActionAllowedForRole(action, resourceType, userRole);
    }

    return false;
  }

  /**
   * Check if a role can create a specific resource type
   */
  private canCreateResource(userRole: Role | string, resourceType: string): boolean {
    const creationPermissions: Record<string, Role[]> = {
      course: [Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN],
      post: [Role.STUDENT, Role.INSTRUCTOR, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN],
      group: [Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN],
      page: [Role.INSTRUCTOR, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN],
      event: [Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN],
      job: [Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN],
      comment: [Role.STUDENT, Role.INSTRUCTOR, Role.RECRUITER, Role.ADMIN, Role.SUPER_ADMIN],
    };

    const allowedRoles = creationPermissions[resourceType];
    return allowedRoles ? allowedRoles.includes(userRole as Role) : false;
  }

  /**
   * Check if an action is allowed for a role on a resource type
   */
  private isActionAllowedForRole(
    action: 'read' | 'update' | 'delete',
    resourceType: string,
    userRole: Role | string,
  ): boolean {
    // Read is generally allowed if user has access
    if (action === 'read') {
      return true;
    }

    // Update and delete require ownership or higher privileges
    // This is a simplified check - should be more granular in production
    return userRole === Role.INSTRUCTOR || userRole === Role.ADMIN;
  }
}
