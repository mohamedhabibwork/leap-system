import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { 
  RESOURCE_TYPE_KEY, 
  RESOURCE_ID_PARAM_KEY,
  SKIP_OWNERSHIP_KEY,
} from '../decorators/resource-type.decorator';
import { OwnershipService } from '../services/ownership.service';
import { Role, isSuperAdmin } from '../enums/roles.enum';
import { ForbiddenResourceException } from '../exceptions/forbidden-resource.exception';

/**
 * Resource Owner Guard
 * 
 * Verifies that the user owns the resource they're trying to access
 * or has sufficient privileges (admin/super admin)
 * 
 * Usage:
 * @ResourceType('course')
 * @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
 * @Get(':id')
 * async getCourse(@Param('id') id: number) { ... }
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  private readonly logger = new Logger(ResourceOwnerGuard.name);

  constructor(
    private reflector: Reflector,
    private ownershipService: OwnershipService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();
    const url = request.url || '';
    const path = request.route?.path || url.split('?')[0] || '';
    
    // Check if ownership check should be skipped
    const skipOwnership = this.reflector.getAllAndOverride<boolean>(
      SKIP_OWNERSHIP_KEY,
      [handler, controller],
    );

    if (skipOwnership) {
      this.logger.debug(`[${request.method} ${url}] Ownership check skipped for this endpoint`);
      return true;
    }
    
    // Check if this is a list endpoint by URL pattern
    // List endpoints like /my-enrollments, /my-courses, etc. should be allowed
    const isListEndpoint = path.includes('/my-') || 
                          path.endsWith('/enrollments') || 
                          path.endsWith('/courses') ||
                          !path.match(/\/\d+$/); // No numeric ID at the end
    
    // Get resource ID from params
    const resourceIdParam = this.reflector.getAllAndOverride<string>(
      RESOURCE_ID_PARAM_KEY,
      [handler, controller],
    ) || 'id';

    const resourceId = request.params?.[resourceIdParam];

    // If no resource ID or this is a list endpoint, allow access
    // (user authentication will be handled by JwtAuthGuard)
    if (!resourceId || resourceId === undefined || resourceId === null || isListEndpoint) {
      this.logger.debug(
        `[${request.method} ${url}] ResourceOwnerGuard: List endpoint detected (path: ${path}, param: ${resourceIdParam}), allowing access`
      );
      return true;
    }

    // Get resource type from decorator (only needed if we have a resource ID)
    const resourceType = this.reflector.getAllAndOverride<string>(
      RESOURCE_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no resource type is specified, skip ownership check
    if (!resourceType) {
      this.logger.debug('No resource type specified, skipping ownership check');
      return true;
    }

    // Only check for user if we have a resource ID to check ownership for
    const user = request.user;
    if (!user) {
      this.logger.warn('ResourceOwnerGuard: No user found in request');
      throw new ForbiddenResourceException(resourceType, 'access', 'Authentication required');
    }

    // Get user role
    const userRole = this.getUserRole(user);

    // Super admin bypass - can access everything
    if (isSuperAdmin(userRole)) {
      this.logger.debug(
        `ResourceOwnerGuard: Super admin ${user.id} bypassed ownership check for ${resourceType}`
      );
      return true;
    }

    // Convert to number if it's a string
    const numericResourceId = parseInt(resourceId, 10);

    if (isNaN(numericResourceId)) {
      this.logger.warn(
        `ResourceOwnerGuard: Invalid resource ID "${resourceId}" for ${resourceType}`
      );
      throw new ForbiddenResourceException(
        resourceType,
        'access',
        'Invalid resource ID'
      );
    }

    // Check if user can access this resource
    const canAccess = await this.ownershipService.canAccess(
      user.id,
      userRole,
      resourceType,
      numericResourceId,
    );

    if (!canAccess) {
      this.logger.warn(
        `ResourceOwnerGuard: User ${user.id} with role "${userRole}" ` +
        `denied access to ${resourceType}:${numericResourceId}`
      );
      throw new ForbiddenResourceException(
        resourceType,
        'access',
        'You do not own this resource'
      );
    }

    this.logger.debug(
      `ResourceOwnerGuard: User ${user.id} authorized to access ${resourceType}:${numericResourceId}`
    );

    return true;
  }

  /**
   * Extract user's role from user object
   */
  private getUserRole(user: any): string {
    if (user.role && typeof user.role === 'string') {
      return user.role;
    }
    if (user.roleName && typeof user.roleName === 'string') {
      return user.roleName;
    }
    if (user.role && user.role.name) {
      return user.role.name;
    }
    return Role.STUDENT; // Default to lowest privilege
  }
}
