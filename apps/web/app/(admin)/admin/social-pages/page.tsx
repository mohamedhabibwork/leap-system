'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Layout, CheckCircle, Star } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/data-table';
import { StatsCards } from '@/components/admin/shared/stats-cards';
import { SearchInput } from '@/components/admin/shared/search-input';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { useAdminSocialPages } from '@/lib/hooks/use-admin-api';

export default function AdminSocialPagesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { useList, useStatistics } = useAdminSocialPages();
  const { data: pagesData, isLoading } = useList({ page, limit, search });
  const { data: stats } = useStatistics();

  const statsCards = [
    { title: 'Total Pages', value: (stats as any)?.total || 0, icon: Layout, color: 'text-blue-500' },
    { title: 'Verified', value: (stats as any)?.verified || 0, icon: CheckCircle, color: 'text-green-500' },
    { title: 'Featured', value: (stats as any)?.featured || 0, icon: Star, color: 'text-yellow-500' },
  ];

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'category',
      label: 'Category',
      render: (page: any) => page.category?.nameEn || 'N/A',
    },
    { key: 'followerCount', label: 'Followers' },
    { key: 'likeCount', label: 'Likes' },
    {
      key: 'isVerified',
      label: 'Verified',
      render: (page: any) =>
        page.isVerified ? <CheckCircle className="h-4 w-4 text-green-500" /> : null,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (page: any) => new Date(page.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Pages</h1>
        <p className="text-muted-foreground mt-2">Manage business and community pages</p>
      </div>

      <StatsCards stats={statsCards} />

      <Card>
        <CardHeader>
          <SearchInput value={search} onChange={setSearch} placeholder="Search pages..." />
        </CardHeader>
        <CardContent>
          <DataTable
            data={pagesData?.data || []}
            columns={columns}
            isLoading={isLoading}
            pagination={
              pagesData
                ? {
                    page,
                    limit,
                    total: pagesData.total,
                    totalPages: pagesData.totalPages,
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
