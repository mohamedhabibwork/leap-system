import { ForbiddenException } from '@nestjs/common';

/**
 * Custom exception for forbidden resource access
 * Provides more context about what resource and action were denied
 */
export class ForbiddenResourceException extends ForbiddenException {
  constructor(
    resource: string, 
    action: string,
    reason?: string
  ) {
    const message = reason 
      ? `You do not have permission to ${action} this ${resource}. ${reason}`
      : `You do not have permission to ${action} this ${resource}`;

    super({
      statusCode: 403,
      message,
      error: 'Forbidden',
      resource,
      action,
    });
  }
}

/**
 * Exception for when user tries to access another user's data
 */
export class NotResourceOwnerException extends ForbiddenResourceException {
  constructor(resource: string) {
    super(resource, 'access', 'You can only access your own resources');
  }
}

/**
 * Exception for insufficient role level
 */
export class InsufficientRoleException extends ForbiddenException {
  constructor(requiredRoles: string[]) {
    super({
      statusCode: 403,
      message: `Insufficient permissions. Required roles: ${requiredRoles.join(' or ')}`,
      error: 'Forbidden',
      requiredRoles,
    });
  }
}
