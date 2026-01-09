'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageLoader } from '@/components/loading/page-loader';

export function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (
      allowedRoles && 
      session?.user?.role && 
      !allowedRoles.includes(session.user.role)
    ) {
      router.push('/hub');
    }
  }, [status, session, router, allowedRoles]);
  
  if (status === 'loading') return <PageLoader />;
  
  return <>{children}</>;
}
