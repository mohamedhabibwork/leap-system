'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { CreatePostModal } from '@/components/modals';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
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
import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { LookupTypeCode } from '@leap-lms/shared-types';
import { usePagePosts, usePages, useMyPosts, useDeletePost } from '@/lib/hooks/use-api';

export default function MyPostsPage() {
  const t = useTranslations('myPosts');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);

  // Fetch lookups for post visibility
  const { data: visibilityTypes } = useLookupsByType(LookupTypeCode.POST_VISIBILITY);

  // Helper function to get lookup label by code
  const getLookupLabel = (code: string, lookups: any[] | undefined): string => {
    if (!lookups) return code;
    const lookup = lookups.find((l) => l.code === code);
    return lookup?.nameEn || code;
  };

  // Fetch user's posts
  const { data: postsData, isLoading: isLoadingPosts } = useMyPosts({
    search: searchQuery,
  });
  
  const posts = (postsData?.data || []).map((post: any) => ({
    id: post.id,
    content: post.content || '',
    visibility: post.visibilityId ? 'public' : 'public', // TODO: Map visibilityId to code
    reactionCount: post.reactionCount || 0,
    commentCount: post.commentCount || 0,
    shareCount: post.shareCount || 0,
    views: post.viewCount || 0,
    createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
  }));
  
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'public' && (post.visibility === 'public')) ||
      (filter === 'friends' && (post.visibility === 'friends' || post.visibility === 'friends_only')) ||
      (filter === 'only_me' && (post.visibility === 'only_me' || post.visibility === 'private'));
    return matchesSearch && matchesFilter;
  });

  const deletePostMutation = useDeletePost();

  const handleDelete = async (postId: number) => {
    try {
      await deletePostMutation.mutateAsync(postId);
      toast.success(t('deleteSuccess'));
      setDeletePostId(null);
    } catch (error) {
      toast.error(t('deleteError'));
    }
  };

  const getVisibilityColor = (visibilityCode: string) => {
    // Use metadata or default colors based on visibility code
    if (visibilityCode === 'public') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (visibilityCode === 'friends' || visibilityCode === 'friends_only') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    if (visibilityCode === 'only_me' || visibilityCode === 'private') {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-start">{t('title')}</h1>
          <p className="text-muted-foreground mt-2 text-start">
            {t('description')}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="me-2 h-4 w-4" />
          {t('createPost')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium text-start">{t('totalPosts')}</p>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{posts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium text-start">{t('totalEngagement')}</p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">
              {posts.reduce((sum, p) => sum + p.reactionCount + p.commentCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium text-start">{t('totalViews')}</p>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">
              {posts.reduce((sum, p) => sum + p.views, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium text-start">{t('avgEngagement')}</p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">
              {posts.length > 0
                ? Math.round(
                    posts.reduce((sum, p) => sum + p.reactionCount + p.commentCount, 0) /
                      posts.length
                  )
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10 text-start"
          />
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">{t('all')}</TabsTrigger>
            <TabsTrigger value="public">{t('public')}</TabsTrigger>
            <TabsTrigger value="friends">{t('friends')}</TabsTrigger>
            <TabsTrigger value="only_me">{t('onlyMe')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoadingPosts ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading posts...</p>
            </CardContent>
          </Card>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noPostsFound')}</p>
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="me-2 h-4 w-4" />
                {t('createFirstPost')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getVisibilityColor(post.visibility)}>
                        {getLookupLabel(post.visibility, visibilityTypes)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(post.createdAt, 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-start line-clamp-2">{post.content}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="me-2 h-4 w-4" />
                        {t('edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="me-2 h-4 w-4" />
                        {t('viewAnalytics')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeletePostId(post.id)}
                      >
                        <Trash2 className="me-2 h-4 w-4" />
                        {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{t('reactions', { count: post.reactionCount })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{t('comments', { count: post.commentCount })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{t('views', { count: post.views })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <CreatePostModal open={showCreateModal} onOpenChange={setShowCreateModal} />

      {/* Delete Confirmation */}
      <AlertDialog open={deletePostId !== null} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">{t('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              {t('deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostId && handleDelete(deletePostId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
