'use client';

import React, { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roleId: number;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const user: User | null = session?.user
    ? {
        id: (session.user as any).id,
        email: session.user.email || '',
        username: (session.user as any).username || '',
        firstName: (session.user as any).firstName,
        lastName: (session.user as any).lastName,
        roleId: (session.user as any).roleId,
        roles: (session.user as any).roles || [],
        permissions: (session.user as any).permissions || [],
      }
    : null;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
