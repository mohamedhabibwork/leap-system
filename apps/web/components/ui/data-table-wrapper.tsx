'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonTable } from '@/components/ui/skeleton-card';
import { ErrorState } from '@/components/ui/error-state';
import { InlineEmpty } from '@/components/ui/empty-state';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableWrapperProps<T> {
  data: T[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  children: (data: T[]) => React.ReactNode;
  columns?: number;
}

export function DataTableWrapper<T>({
  data,
  isLoading,
  error,
  onRetry,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  pagination,
  emptyMessage = 'No data found',
  children,
  columns = 4,
}: DataTableWrapperProps<T>) {
  const t = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="ps-10"
          />
        </div>
      )}

      {isLoading ? (
        <SkeletonTable columns={columns} />
      ) : data.length === 0 ? (
        <InlineEmpty message={emptyMessage} />
      ) : (
        <>
          {children(data)}
          
          {pagination && pagination.total > pagination.pageSize && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground text-start">
                {t('pagination.showing', {
                  from: Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total),
                  to: Math.min(pagination.page * pagination.pageSize, pagination.total),
                  total: pagination.total
                })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4 rtl-flip" />
                  {t('actions.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page * pagination.pageSize >= pagination.total}
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                >
                  {t('actions.next')}
                  <ChevronRight className="h-4 w-4 ms-1 rtl-flip" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
