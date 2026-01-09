'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UsersRound } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/data-table';
import { StatsCards } from '@/components/admin/shared/stats-cards';
import { SearchInput } from '@/components/admin/shared/search-input';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { useAdminGroups } from '@/lib/hooks/use-admin-api';

export default function AdminGroupsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { useList, useStatistics } = useAdminGroups();
  const { data: groupsData, isLoading } = useList({ page, limit, search });
  const { data: stats } = useStatistics();

  const statsCards = [
    { title: 'Total Groups', value: (stats as any)?.total || 0, icon: UsersRound, color: 'text-blue-500' },
    { title: 'Public', value: (stats as any)?.public || 0, icon: UsersRound, color: 'text-green-500' },
    { title: 'Private', value: (stats as any)?.private || 0, icon: UsersRound, color: 'text-orange-500' },
  ];

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'privacyType',
      label: 'Privacy',
      render: (group: any) => <StatusBadge status={group.privacyType?.nameEn || 'Public'} />,
    },
    { key: 'memberCount', label: 'Members' },
    {
      key: 'creator',
      label: 'Creator',
      render: (group: any) => group.creator?.email || 'Unknown',
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (group: any) => new Date(group.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
        <p className="text-muted-foreground mt-2">Manage community groups</p>
      </div>

      <StatsCards stats={statsCards} />

      <Card>
        <CardHeader>
          <SearchInput value={search} onChange={setSearch} placeholder="Search groups..." />
        </CardHeader>
        <CardContent>
          <DataTable
            data={groupsData?.data || []}
            columns={columns}
            isLoading={isLoading}
            pagination={
              groupsData
                ? {
                    page,
                    limit,
                    total: groupsData.total,
                    totalPages: groupsData.totalPages,
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
