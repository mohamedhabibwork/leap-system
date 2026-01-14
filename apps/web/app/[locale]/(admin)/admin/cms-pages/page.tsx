'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText, Eye } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/data-table';
import { StatsCards } from '@/components/admin/shared/stats-cards';
import { SearchInput } from '@/components/admin/shared/search-input';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { useAdminCmsPages } from '@/lib/hooks/use-admin-api';

export default function AdminCMSPagesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { useList, useStatistics } = useAdminCmsPages();
  const { data: pagesData, isLoading } = useList({ page, limit, search });
  const { data: stats } = useStatistics();

  const statsCards = [
    { title: 'Total Pages', value: (stats as any)?.total || 0, icon: FileText, color: 'text-blue-500' },
    { title: 'Published', value: (stats as any)?.published || 0, icon: Eye, color: 'text-green-500' },
    { title: 'Draft', value: (stats as any)?.draft || 0, icon: FileText, color: 'text-orange-500' },
  ];

  const columns = [
    { key: 'titleEn', label: 'Title' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'pageType',
      label: 'Type',
      render: (page: any) => <StatusBadge status={page.pageType?.nameEn || 'Page'} />,
    },
    {
      key: 'isPublished',
      label: 'Status',
      render: (page: any) => (
        <StatusBadge status={page.isPublished ? 'Published' : 'Draft'} />
      ),
    },
    {
      key: 'publishedAt',
      label: 'Published',
      render: (page: any) =>
        page.publishedAt ? new Date(page.publishedAt).toLocaleDateString() : 'N/A',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CMS Pages</h1>
        <p className="text-muted-foreground mt-2">Manage content pages and documentation</p>
      </div>

      <StatsCards stats={statsCards} />

      <Card>
        <CardHeader>
          <SearchInput value={search} onChange={setSearch} placeholder="Search CMS pages..." />
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
