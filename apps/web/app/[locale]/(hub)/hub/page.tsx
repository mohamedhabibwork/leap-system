'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

export default function HubPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/hub/social');
  }, [router]);

  return null;
}
