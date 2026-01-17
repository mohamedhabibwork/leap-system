'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Flag, AlertTriangle, CheckCircle } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/data-table';
import { StatsCards } from '@/components/admin/shared/stats-cards';
import { SearchInput } from '@/components/admin/shared/search-input';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { useAdminReports } from '@/lib/hooks/use-admin-api';

export default function AdminReportsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { useList, useStatistics } = useAdminReports();
  const { data: reportsData, isLoading } = useList({ page, limit, search });
  const { data: stats } = useStatistics();

  const statsCards = [
    { title: 'Total Reports', value: (stats )?.total || 0, icon: Flag, color: 'text-blue-500' },
    { title: 'Open', value: (stats )?.open || 0, icon: AlertTriangle, color: 'text-orange-500' },
    { title: 'In Review', value: (stats )?.inReview || 0, icon: Flag, color: 'text-yellow-500' },
    { title: 'Resolved', value: (stats )?.resolved || 0, icon: CheckCircle, color: 'text-green-500' },
  ];

  const columns = [
    {
      key: 'reporter',
      label: 'Reporter',
      render: (report: any) => report.reporter?.email || 'Unknown',
    },
    {
      key: 'reportableType',
      label: 'Type',
      render: (report: any) => <StatusBadge status={report.reportableType} />,
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (report: any) => <div className="max-w-md truncate">{report.reason}</div>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (report: any) => <StatusBadge status={report.status?.nameEn || 'Open'} />,
    },
    {
      key: 'createdAt',
      label: 'Reported',
      render: (report: any) => new Date(report.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Moderation</h1>
        <p className="text-muted-foreground mt-2">Review and manage content reports</p>
      </div>

      <StatsCards stats={statsCards} />

      <Card>
        <CardHeader>
          <SearchInput value={search} onChange={setSearch} placeholder="Search reports..." />
        </CardHeader>
        <CardContent>
          <DataTable
            data={reportsData?.data || []}
            columns={columns}
            isLoading={isLoading}
            pagination={
              reportsData
                ? {
                    page,
                    limit,
                    total: reportsData.total,
                    totalPages: reportsData.totalPages,
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
