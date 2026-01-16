'use client';

import { Button } from './button';
import { LogOut, Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import apiClient from '@/lib/api/client';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

/**
 * Logout button that handles complete logout from backend and NextAuth
 */
export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  className,
  children,
  showIcon = true,
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Logout from backend first
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Silently handle backend logout errors
        console.error('Backend logout error:', error);
      }
      
      // Then sign out from NextAuth
      await signOut({ callbackUrl: '/login', redirect: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Still try to redirect on error
      window.location.href = '/login';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging out...
        </>
      ) : (
        <>
          {showIcon && <LogOut className="mr-2 h-4 w-4" />}
          {children || 'Logout'}
        </>
      )}
    </Button>
  );
}
