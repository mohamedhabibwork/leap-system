import { 
  Injectable, 
  CanActivate, 
  ExecutionContext,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role, ROLE_HIERARCHY, isSuperAdmin } from '../enums/roles.enum';

/**
 * Enhanced RolesGuard with role hierarchy and super admin bypass
 * 
 * Features:
 * - Role hierarchy checking (higher roles can access lower role endpoints)
 * - Super admin bypass (super admin can access everything)
 * - Proper logging for security auditing
 * - Support for multiple role requirements (OR logic)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user exists and has role information
    if (!user) {
      this.logger.warn('RolesGuard: No user found in request');
      throw new ForbiddenException('Authentication required');
    }

    // Get user's role - could be from user.role or user.roleName
    const userRole = this.getUserRole(user);

    if (!userRole) {
      this.logger.warn(`RolesGuard: User ${user.id} has no role assigned`);
      throw new ForbiddenException('User has no role assigned');
    }

    // Super admin bypass - can access everything
    if (isSuperAdmin(userRole)) {
      this.logger.debug(
        `RolesGuard: Super admin ${user.id} accessing ${request.method} ${request.url}`
      );
      return true;
    }

    // Check if user has one of the required roles (OR logic)
    const hasRequiredRole = requiredRoles.some((requiredRole) => {
      // Direct role match
      if (userRole === requiredRole) {
        return true;
      }

      // Role hierarchy check - higher roles can access lower role endpoints
      const userLevel = ROLE_HIERARCHY[userRole as Role];
      const requiredLevel = ROLE_HIERARCHY[requiredRole];

      if (userLevel !== undefined && requiredLevel !== undefined) {
        return userLevel >= requiredLevel;
      }

      return false;
    });

    if (!hasRequiredRole) {
      this.logger.warn(
        `RolesGuard: User ${user.id} with role "${userRole}" attempted to access ` +
        `${request.method} ${request.url} requiring roles: ${requiredRoles.join(', ')}`
      );
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(' or ')}`
      );
    }

    this.logger.debug(
      `RolesGuard: User ${user.id} with role "${userRole}" authorized for ${request.method} ${request.url}`
    );

    return true;
  }

  /**
   * Extract user's role from user object
   * Handles different possible structures (role, roleName, roleId with lookup)
   */
  private getUserRole(user: any): string | null {
    // Try direct role field
    if (user.role && typeof user.role === 'string') {
      return user.role;
    }

    // Try roleName field (from some auth systems)
    if (user.roleName && typeof user.roleName === 'string') {
      return user.roleName;
    }

    // Try nested role object
    if (user.role && user.role.name) {
      return user.role.name;
    }

    // For backwards compatibility, check if we have a role mapping
    // This would need to be extended to fetch from database if only roleId is available
    if (user.roleId) {
      this.logger.warn(
        `RolesGuard: User ${user.id} only has roleId ${user.roleId}, ` +
        'role name should be included in JWT token'
      );
      // In production, you might want to fetch the role from database here
      // For now, return null to deny access
      return null;
    }

    return null;
  }
}
