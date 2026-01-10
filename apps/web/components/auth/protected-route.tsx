'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';
import { PageLoader } from '@/components/loading/page-loader';

export function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: number[];
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (
      allowedRoles && 
      session?.user?.roleId && 
      !allowedRoles.includes(session.user.roleId)
    ) {
      router.push('/hub');
    }
  }, [status, session, router, allowedRoles]);
  
  if (status === 'loading') return <PageLoader />;
  
  return <>{children}</>;
}
