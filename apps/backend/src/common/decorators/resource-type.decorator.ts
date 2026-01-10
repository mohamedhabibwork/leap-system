import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to specify the resource type for ownership verification
 * Used in conjunction with ResourceOwnerGuard
 * 
 * @example
 * @ResourceType('course')
 * @Get(':id')
 * async getCourse(@Param('id') id: number) {
 *   // Only course owner or admin can access
 * }
 */
export const RESOURCE_TYPE_KEY = 'resourceType';
export const ResourceType = (type: string) => SetMetadata(RESOURCE_TYPE_KEY, type);

/**
 * Decorator to specify custom param name for resource ID
 * By default, uses 'id' from route params
 */
export const RESOURCE_ID_PARAM_KEY = 'resourceIdParam';
export const ResourceIdParam = (paramName: string) => 
  SetMetadata(RESOURCE_ID_PARAM_KEY, paramName);

/**
 * Decorator to skip ownership check
 * Useful for endpoints that list all resources or have custom authorization logic
 */
export const SKIP_OWNERSHIP_KEY = 'skipOwnership';
export const SkipOwnership = () => SetMetadata(SKIP_OWNERSHIP_KEY, true);
