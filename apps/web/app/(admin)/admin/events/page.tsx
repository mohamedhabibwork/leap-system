'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/data-table';
import { StatsCards } from '@/components/admin/shared/stats-cards';
import { SearchInput } from '@/components/admin/shared/search-input';
import { BulkActionsToolbar } from '@/components/admin/shared/bulk-actions-toolbar';
import { ExportButton } from '@/components/admin/shared/export-button';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { useAdminEvents } from '@/lib/hooks/use-admin-api';
import { toast } from 'sonner';

export default function AdminEventsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { useList, useStatistics, useBulkAction, useExport } = useAdminEvents();
  const { data: eventsData, isLoading } = useList({ page, limit, search });
  const { data: stats } = useStatistics();
  const bulkAction = useBulkAction();
  const exportData = useExport();

  const statsCards = [
    { title: 'Total Events', value: (stats as any)?.total || 0, icon: Calendar, color: 'text-blue-500' },
    { title: 'Upcoming', value: (stats as any)?.upcoming || 0, icon: Calendar, color: 'text-green-500' },
    { title: 'Past', value: (stats as any)?.past || 0, icon: Calendar, color: 'text-gray-500' },
    { title: 'Featured', value: (stats as any)?.featured || 0, icon: Star, color: 'text-yellow-500' },
  ];

  const columns = [
    { key: 'titleEn', label: 'Title' },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (event: any) => new Date(event.startDate).toLocaleDateString(),
    },
    {
      key: 'location',
      label: 'Location',
      render: (event: any) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {event.location || 'Virtual'}
        </div>
      ),
    },
    {
      key: 'registrationCount',
      label: 'Registrations',
      render: (event: any) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {event.registrationCount || 0}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (event: any) => <StatusBadge status={event.status?.nameEn || 'Active'} />,
    },
    {
      key: 'isFeatured',
      label: 'Featured',
      render: (event: any) =>
        event.isFeatured ? <Star className="h-4 w-4 text-yellow-500" /> : null,
    },
  ];

  const bulkActions = [
    { label: 'Feature Selected', value: 'feature' },
    { label: 'Cancel Selected', value: 'cancel', variant: 'destructive' as const },
    { label: 'Delete Selected', value: 'delete', variant: 'destructive' as const },
  ];

  const handleBulkAction = async (action: string) => {
    try {
      await bulkAction.mutateAsync({ ids: selectedIds, action });
      toast.success('Bulk action completed successfully');
      setSelectedIds([]);
    } catch (error) {
      toast.error('Failed to perform bulk action');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-2">Manage platform events and registrations</p>
        </div>
        <ExportButton onExport={() => exportData.mutateAsync({ page, limit, search })} />
      </div>

      <StatsCards stats={statsCards} />

      <Card>
        <CardHeader>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search events..."
          />
        </CardHeader>
        <CardContent>
          <BulkActionsToolbar
            selectedCount={selectedIds.length}
            actions={bulkActions}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedIds([])}
          />
          <DataTable
            data={eventsData?.data || []}
            columns={columns}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            isLoading={isLoading}
            pagination={
              eventsData
                ? {
                    page,
                    limit,
                    total: eventsData.total,
                    totalPages: eventsData.totalPages,
                    onPageChange: setPage,
                    onLimitChange: setLimit,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
