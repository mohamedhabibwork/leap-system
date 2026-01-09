'use client';

import { useGroups } from '@/lib/hooks/use-api';
import { GroupCard } from '@/components/cards/group-card';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { EmptyState } from '@/components/empty/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Plus, Users } from 'lucide-react';
import { useState } from 'react';

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('my-groups');
  const { data: groups, isLoading } = useGroups();

  const filteredGroups = groups?.filter((group: any) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'my-groups' && group.isJoined) ||
      (filter === 'discover' && !group.isJoined);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground mt-2">
            Connect with people who share your interests
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="all">All Groups</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <CardSkeleton count={6} />
            </div>
          ) : filteredGroups && filteredGroups.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map((group: any) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title={filter === 'my-groups' ? 'No groups yet' : 'No groups found'}
              description={
                filter === 'my-groups'
                  ? 'Join your first group to get started!'
                  : 'Try adjusting your search or check back later'
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
