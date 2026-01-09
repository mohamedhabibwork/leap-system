'use client';

import React from 'react';
import { useRBAC } from '@/lib/hooks/use-rbac';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface ProtectedProps {
  children: React.ReactNode;
  roles?: string[];
  permissions?: string[];
  requireAll?: boolean; // If true, requires all roles/permissions; if false, requires any
  fallback?: React.ReactNode;
  showFallback?: boolean; // If false, returns null instead of fallback
}

/**
 * Protected component wrapper that conditionally renders based on RBAC
 * 
 * @example
 * <Protected roles={['admin']}>
 *   <AdminContent />
 * </Protected>
 * 
 * @example
 * <Protected permissions={['tickets.delete']}>
 *   <DeleteButton />
 * </Protected>
 * 
 * @example
 * <Protected roles={['admin', 'moderator']} requireAll={false}>
 *   <ModerateContent />
 * </Protected>
 */
export function Protected({
  children,
  roles,
  permissions,
  requireAll = false,
  fallback,
  showFallback = true,
}: ProtectedProps) {
  const rbac = useRBAC();

  // If still loading, don't render anything
  if (rbac.isLoading) {
    return null;
  }

  let hasAccess = true;

  // Check roles
  if (roles && roles.length > 0) {
    hasAccess = requireAll 
      ? rbac.hasAllRoles(roles)
      : rbac.hasAnyRole(roles);
  }

  // Check permissions
  if (hasAccess && permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? rbac.hasAllPermissions(permissions)
      : rbac.hasAnyPermission(permissions);
  }

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If no access and showFallback is false, return null
  if (!showFallback) {
    return null;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access denied message
  return (
    <Alert variant="destructive" className="my-4">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Access Denied</AlertTitle>
      <AlertDescription>
        You don't have permission to access this content.
        {roles && roles.length > 0 && (
          <div className="mt-2 text-sm">
            Required roles: {roles.join(', ')}
          </div>
        )}
        {permissions && permissions.length > 0 && (
          <div className="mt-2 text-sm">
            Required permissions: {permissions.join(', ')}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Higher-order component version of Protected
 */
export function withProtection<P extends object>(
  Component: React.ComponentType<P>,
  protectionProps: Omit<ProtectedProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <Protected {...protectionProps}>
        <Component {...props} />
      </Protected>
    );
  };
}
