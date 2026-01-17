'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Briefcase, MapPin, Users, Star } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/data-table';
import { StatsCards } from '@/components/admin/shared/stats-cards';
import { SearchInput } from '@/components/admin/shared/search-input';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { useAdminJobs } from '@/lib/hooks/use-admin-api';

export default function AdminJobsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { useList, useStatistics } = useAdminJobs();
  const { data: jobsData, isLoading } = useList({ page, limit, search });
  const { data: stats } = useStatistics();

  const statsCards = [
    { title: 'Total Jobs', value: (stats )?.total || 0, icon: Briefcase, color: 'text-blue-500' },
    { title: 'Active', value: (stats )?.active || 0, icon: Briefcase, color: 'text-green-500' },
    { title: 'Closed', value: (stats )?.closed || 0, icon: Briefcase, color: 'text-gray-500' },
    { title: 'Featured', value: (stats )?.featured || 0, icon: Star, color: 'text-yellow-500' },
  ];

  const columns = [
    { key: 'titleEn', label: 'Title' },
    { key: 'location', label: 'Location' },
    { key: 'applicationCount', label: 'Applications' },
    {
      key: 'status',
      label: 'Status',
      render: (job: any) => <StatusBadge status={job.status?.nameEn || 'Active'} />,
    },
    {
      key: 'createdAt',
      label: 'Posted',
      render: (job: any) => new Date(job.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground mt-2">Manage job postings and applications</p>
      </div>

      <StatsCards stats={statsCards} />

      <Card>
        <CardHeader>
          <SearchInput value={search} onChange={setSearch} placeholder="Search jobs..." />
        </CardHeader>
        <CardContent>
          <DataTable
            data={jobsData?.data || []}
            columns={columns}
            isLoading={isLoading}
            pagination={
              jobsData
                ? {
                    page,
                    limit,
                    total: jobsData.total,
                    totalPages: jobsData.totalPages,
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
