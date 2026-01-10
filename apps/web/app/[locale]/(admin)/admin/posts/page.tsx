'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageSquare, Heart, Eye } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/data-table';
import { StatsCards } from '@/components/admin/shared/stats-cards';
import { SearchInput } from '@/components/admin/shared/search-input';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { useAdminPosts } from '@/lib/hooks/use-admin-api';

export default function AdminPostsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { useList, useStatistics } = useAdminPosts();
  const { data: postsData, isLoading } = useList({ page, limit, search });
  const { data: stats } = useStatistics();

  const statsCards = [
    { title: 'Total Posts', value: (stats as any)?.total || 0, icon: MessageSquare, color: 'text-blue-500' },
    { title: 'Public', value: (stats as any)?.public || 0, icon: Eye, color: 'text-green-500' },
    { title: 'Group Posts', value: (stats as any)?.groupPosts || 0, icon: MessageSquare },
    { title: 'Page Posts', value: (stats as any)?.pagePosts || 0, icon: MessageSquare },
  ];

  const columns = [
    {
      key: 'user',
      label: 'Author',
      render: (post: any) => post.user?.username || post.user?.email || 'Unknown',
    },
    {
      key: 'content',
      label: 'Content',
      render: (post: any) => (
        <div className="max-w-md truncate">{post.content || '[No content]'}</div>
      ),
    },
    { key: 'reactionCount', label: 'Reactions' },
    { key: 'commentCount', label: 'Comments' },
    {
      key: 'visibility',
      label: 'Visibility',
      render: (post: any) => <StatusBadge status={post.visibility?.nameEn || 'Public'} />,
    },
    {
      key: 'createdAt',
      label: 'Posted',
      render: (post: any) => new Date(post.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Posts</h1>
        <p className="text-muted-foreground mt-2">Moderate and manage social posts</p>
      </div>

      <StatsCards stats={statsCards} />

      <Card>
        <CardHeader>
          <SearchInput value={search} onChange={setSearch} placeholder="Search posts..." />
        </CardHeader>
        <CardContent>
          <DataTable
            data={postsData?.data || []}
            columns={columns}
            isLoading={isLoading}
            pagination={
              postsData
                ? {
                    page,
                    limit,
                    total: postsData.total,
                    totalPages: postsData.totalPages,
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
