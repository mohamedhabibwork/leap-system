'use client';

import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  published: 'default',
  open: 'default',
  pending: 'secondary',
  draft: 'secondary',
  inactive: 'secondary',
  closed: 'outline',
  rejected: 'destructive',
  banned: 'destructive',
  deleted: 'destructive',
};

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const badgeVariant = variant || statusVariants[status.toLowerCase()] || 'default';

  return <Badge variant={badgeVariant}>{status}</Badge>;
}
