'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  TrendingUp,
  Crown,
} from 'lucide-react';
import { CreateGroupModal } from '@/components/modals';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function MyGroupsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('owned');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);

  // Mock data - replace with real API calls
  const groups = [
    {
      id: 1,
      name: 'JavaScript Developers',
      description: 'A community for JS enthusiasts',
      privacy: 'public',
      memberCount: 245,
      coverImage: null,
      isOwned: true,
      role: 'admin',
    },
    {
      id: 2,
      name: 'React Learners',
      description: 'Learn React together',
      privacy: 'public',
      memberCount: 189,
      coverImage: null,
      isOwned: true,
      role: 'admin',
    },
    {
      id: 3,
      name: 'Web Design Tips',
      description: 'Share design ideas and tips',
      privacy: 'private',
      memberCount: 67,
      coverImage: null,
      isOwned: false,
      role: 'member',
    },
  ];

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'owned' && group.isOwned) ||
      (filter === 'joined' && !group.isOwned);
    return matchesSearch && matchesFilter;
  });

  const ownedGroups = groups.filter((g) => g.isOwned);
  const joinedGroups = groups.filter((g) => !g.isOwned);

  const handleDelete = async (groupId: number) => {
    try {
      // Call delete API
      toast.success('Group deleted successfully');
      setDeleteGroupId(null);
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-start">My Groups</h1>
          <p className="text-muted-foreground mt-2 text-start">
            Manage your groups and memberships
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="me-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Owned Groups</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{ownedGroups.length}</div>
            <p className="text-xs text-muted-foreground text-start mt-1">
              {ownedGroups.reduce((sum, g) => sum + g.memberCount, 0)} total members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Joined Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{joinedGroups.length}</div>
            <p className="text-xs text-muted-foreground text-start mt-1">
              Active member
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Total Members</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">
              {groups.reduce((sum, g) => sum + g.memberCount, 0)}
            </div>
            <p className="text-xs text-green-600 text-start mt-1">
              ↑ 8% this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10 text-start"
          />
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="owned">Owned</TabsTrigger>
            <TabsTrigger value="joined">Joined</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Groups Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No groups found</p>
              {filter === 'owned' && (
                <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                  <Plus className="me-2 h-4 w-4" />
                  Create Your First Group
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredGroups.map((group) => (
            <Card key={group.id} className="overflow-hidden">
              {/* Cover Image */}
              {group.coverImage ? (
                <div className="relative w-full h-32">
                  <Image
                    src={group.coverImage}
                    alt={group.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/5" />
              )}

              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link href={`/hub/social/groups/${group.id}`}>
                      <h3 className="font-semibold text-lg truncate hover:underline text-start">
                        {group.name}
                        {group.isOwned && (
                          <Crown className="inline h-4 w-4 text-yellow-500 ms-1" />
                        )}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={group.privacy === 'public' ? 'default' : 'secondary'}>
                        {group.privacy}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {group.memberCount} members
                      </span>
                    </div>
                  </div>

                  {group.isOwned && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="me-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="me-2 h-4 w-4" />
                          Manage Members
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TrendingUp className="me-2 h-4 w-4" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteGroupId(group.id)}
                        >
                          <Trash2 className="me-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 text-start mt-2">
                    {group.description}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <Link href={`/hub/social/groups/${group.id}`}>
                  <Button variant="outline" className="w-full">
                    View Group
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <CreateGroupModal open={showCreateModal} onOpenChange={setShowCreateModal} />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteGroupId !== null} onOpenChange={() => setDeleteGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">Delete Group</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              Are you sure you want to delete this group? All members will be removed and this
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGroupId && handleDelete(deleteGroupId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
