'use client';

import { useRBAC as useRBACContext } from '../contexts/rbac-context';

/**
 * Hook for role-based access control
 * Provides convenient methods to check user permissions
 */
export function useRBAC() {
  const context = useRBACContext();

  return {
    ...context,
    // Resource-based convenience methods
    canView: (resource: string) => context.hasPermission(`${resource}.view`),
    canCreate: (resource: string) => context.hasPermission(`${resource}.create`),
    canUpdate: (resource: string) => context.hasPermission(`${resource}.update`),
    canDelete: (resource: string) => context.hasPermission(`${resource}.delete`),
    // Common role checks
    isAdmin: () => context.hasRole('admin') || context.hasRole('superadmin'),
    isSuperAdmin: () => context.hasRole('superadmin'),
    isModerator: () => context.hasRole('moderator'),
    isContentManager: () => context.hasRole('contentmanager'),
    // Combined checks
    canManageContent: () => 
      context.hasAnyRole(['admin', 'superadmin', 'contentmanager']),
    canModerate: () => 
      context.hasAnyRole(['admin', 'superadmin', 'moderator']),
  };
}
