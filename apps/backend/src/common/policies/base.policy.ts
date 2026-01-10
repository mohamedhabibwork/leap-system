import { Role, isSuperAdmin, isAdmin } from '../enums/roles.enum';

/**
 * Base Policy class
 * Provides common authorization logic that all policies can extend
 */
export abstract class BasePolicy {
  /**
   * Check if user can view a resource
   * @param userId - Current user ID
   * @param userRole - Current user role
   * @param resource - The resource to check
   * @returns boolean - true if user can view
   */
  abstract canView(userId: number, userRole: Role | string, resource: any): Promise<boolean>;

  /**
   * Check if user can create a resource
   * @param userId - Current user ID
   * @param userRole - Current user role
   * @param data - Data for the resource to be created
   * @returns boolean - true if user can create
   */
  abstract canCreate(userId: number, userRole: Role | string, data?: any): Promise<boolean>;

  /**
   * Check if user can update a resource
   * @param userId - Current user ID
   * @param userRole - Current user role
   * @param resource - The resource to update
   * @returns boolean - true if user can update
   */
  abstract canUpdate(userId: number, userRole: Role | string, resource: any): Promise<boolean>;

  /**
   * Check if user can delete a resource
   * @param userId - Current user ID
   * @param userRole - Current user role
   * @param resource - The resource to delete
   * @returns boolean - true if user can delete
   */
  abstract canDelete(userId: number, userRole: Role | string, resource: any): Promise<boolean>;

  /**
   * Helper method to check if user is super admin
   */
  protected isSuperAdmin(role: Role | string): boolean {
    return isSuperAdmin(role);
  }

  /**
   * Helper method to check if user is admin or higher
   */
  protected isAdminOrHigher(role: Role | string): boolean {
    return isSuperAdmin(role) || isAdmin(role);
  }

  /**
   * Helper method to check if user owns a resource
   */
  protected isOwner(userId: number, ownerId: number): boolean {
    return userId === ownerId;
  }
}
