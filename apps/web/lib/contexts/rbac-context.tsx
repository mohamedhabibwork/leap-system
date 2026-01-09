'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';

interface RBACContextType {
  roles: string[];
  permissions: string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isLoading: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Extract roles and permissions from user object
      setRoles(user.roles || []);
      setPermissions(user.permissions || []);
      setIsLoading(false);
    } else {
      setRoles([]);
      setPermissions([]);
      setIsLoading(false);
    }
  }, [user]);

  const hasRole = (role: string): boolean => {
    return roles.includes(role.toLowerCase());
  };

  const hasAnyRole = (checkRoles: string[]): boolean => {
    return checkRoles.some(role => hasRole(role));
  };

  const hasAllRoles = (checkRoles: string[]): boolean => {
    return checkRoles.every(role => hasRole(role));
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission.toLowerCase());
  };

  const hasAnyPermission = (checkPermissions: string[]): boolean => {
    return checkPermissions.some(perm => hasPermission(perm));
  };

  const hasAllPermissions = (checkPermissions: string[]): boolean => {
    return checkPermissions.every(perm => hasPermission(perm));
  };

  const value: RBACContextType = {
    roles,
    permissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}

export function useRBAC() {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
}
