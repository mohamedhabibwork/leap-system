'use client';

import { useState } from 'react';
import { usePages } from '@/lib/hooks/use-api';
import { PageCard } from '@/components/cards/page-card';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { EmptyState } from '@/components/empty/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Plus, FileText } from 'lucide-react';
import { CreatePageModal } from '@/components/modals';

export default function PagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: pages, isLoading } = usePages();

  const filteredPages = pages?.filter((page: any) => {
    const matchesSearch = page.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'my-pages' && page.isOwned) ||
      (filter === 'following' && page.isFollowing) ||
      (filter === 'discover' && !page.isFollowing);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-start">Pages</h1>
          <p className="text-muted-foreground mt-2 text-start">
            Discover and follow pages from businesses, brands, and organizations
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="me-2 h-4 w-4" />
          Create Page
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-10 text-start"
        />
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="my-pages">My Pages</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="all">All Pages</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <CardSkeleton count={6} />
            </div>
          ) : filteredPages && filteredPages.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPages.map((page: any) => (
                <PageCard key={page.id} page={page} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title={filter === 'my-pages' ? 'No pages yet' : 'No pages found'}
              description={
                filter === 'my-pages'
                  ? 'Create your first page to get started!'
                  : 'Try adjusting your search or check back later'
              }
              action={
                filter === 'my-pages' ? (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="me-2 h-4 w-4" />
                    Create Page
                  </Button>
                ) : undefined
              }
            />
          )}
        </TabsContent>
      </Tabs>

      <CreatePageModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  );
}
