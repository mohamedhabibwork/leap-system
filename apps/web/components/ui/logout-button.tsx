'use client';

import { Button } from './button';
import { LogOut, Loader2 } from 'lucide-react';
import { completeLogout } from '@/lib/auth/keycloak-logout';
import { useState } from 'react';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

/**
 * Logout button that handles complete logout from Keycloak and NextAuth
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
      await completeLogout('/login');
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
