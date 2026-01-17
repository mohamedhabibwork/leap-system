'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LifeBuoy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/data-table';
import { StatsCards } from '@/components/admin/shared/stats-cards';
import { SearchInput } from '@/components/admin/shared/search-input';
import { BulkActionsToolbar } from '@/components/admin/shared/bulk-actions-toolbar';
import { ExportButton } from '@/components/admin/shared/export-button';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { useAdminTickets } from '@/lib/hooks/use-admin-api';
import { toast } from 'sonner';

export default function AdminTicketsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { useList, useStatistics, useBulkAction, useExport } = useAdminTickets();
  const { data: ticketsData, isLoading } = useList({ page, limit, search });
  const { data: stats } = useStatistics();
  const bulkAction = useBulkAction();
  const exportData = useExport();

  const statsCards = [
    {
      title: 'Total Tickets',
      value: (stats )?.total || 0,
      icon: LifeBuoy,
      color: 'text-blue-500',
    },
    {
      title: 'Open',
      value: (stats )?.open || 0,
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      title: 'Resolved',
      value: (stats )?.resolved || 0,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Closed',
      value: (stats )?.closed || 0,
      icon: XCircle,
      color: 'text-gray-500',
    },
  ];

  const columns = [
    {
      key: 'ticketNumber',
      label: 'Ticket #',
      render: (ticket: any) => (
        <span className="font-mono text-sm">{ticket.ticketNumber}</span>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (ticket: any) => (
        <div className="max-w-md truncate">{ticket.subject}</div>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (ticket: any) => ticket.user?.email || 'N/A',
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (ticket: any) => (
        <StatusBadge status={ticket.priority?.nameEn || 'Normal'} />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (ticket: any) => (
        <StatusBadge status={ticket.status?.nameEn || 'Open'} />
      ),
    },
    {
      key: 'assignee',
      label: 'Assigned To',
      render: (ticket: any) => ticket.assignee?.email || 'Unassigned',
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (ticket: any) =>
        new Date(ticket.createdAt).toLocaleDateString(),
    },
  ];

  const bulkActions = [
    { label: 'Close Selected', value: 'close', variant: 'default' as const },
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

  const handleExport = async () => {
    await exportData.mutateAsync({ page, limit, search });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground mt-2">
            Manage support tickets and customer inquiries
          </p>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      <StatsCards stats={statsCards} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by ticket number, subject, or user..."
            />
          </div>
        </CardHeader>
        <CardContent>
          <BulkActionsToolbar
            selectedCount={selectedIds.length}
            actions={bulkActions}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedIds([])}
          />

          <DataTable
            data={ticketsData?.data || []}
            columns={columns}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            isLoading={isLoading}
            pagination={
              ticketsData
                ? {
                    page,
                    limit,
                    total: ticketsData.total,
                    totalPages: ticketsData.totalPages,
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
