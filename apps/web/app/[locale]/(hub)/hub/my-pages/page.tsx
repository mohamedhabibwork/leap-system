'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  TrendingUp,
  CheckCircle2,
  Users,
  Heart,
} from 'lucide-react';
import { CreatePageModal } from '@/components/modals';
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
import { useMyPages, useDeletePage } from '@/lib/hooks/use-api';

export default function MyPagesPage() {
  const t = useTranslations('myPages');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletePageId, setDeletePageId] = useState<number | null>(null);

  // Fetch user's pages
  const { data: pagesData, isLoading: isLoadingPages } = useMyPages({
    search: searchQuery,
  });
  
  const pages = (pagesData?.data || []).map((page: any) => ({
    id: page.id,
    name: page.name || '',
    description: page.description || '',
    category: page.categoryName || page.category || null,
    followerCount: page.followerCount || 0,
    likeCount: page.likeCount || 0,
    postCount: page.postCount || 0,
    isVerified: page.isVerified || false,
    coverImage: page.coverImageUrl || null,
  }));

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFollowers = pages.reduce((sum, p) => sum + p.followerCount, 0);
  const totalLikes = pages.reduce((sum, p) => sum + p.likeCount, 0);
  const totalPosts = pages.reduce((sum, p) => sum + p.postCount, 0);

  const deletePageMutation = useDeletePage();

  const handleDelete = async (pageId: number) => {
    try {
      await deletePageMutation.mutateAsync(pageId);
      toast.success(t('deleteSuccess'));
      setDeletePageId(null);
    } catch (error) {
      toast.error(t('deleteError'));
    }
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
          {t('createPage')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('totalPages')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{pages.length}</div>
            <p className="text-xs text-muted-foreground text-start mt-1">
              {t('verified', { count: pages.filter(p => p.isVerified).length })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('totalFollowers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{totalFollowers}</div>
            <p className="text-xs text-green-600 text-start mt-1">
              {t('thisMonth')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('totalLikes')}</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{totalLikes}</div>
            <p className="text-xs text-green-600 text-start mt-1">
              {t('likesThisMonth')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('totalPosts')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{totalPosts}</div>
            <p className="text-xs text-muted-foreground text-start mt-1">
              {t('avgPerPage', { count: pages.length > 0 ? Math.round(totalPosts / pages.length) : 0 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-10 text-start"
        />
      </div>

      {/* Pages Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {isLoadingPages ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading pages...</p>
            </CardContent>
          </Card>
        ) : filteredPages.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noPagesFound')}</p>
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="me-2 h-4 w-4" />
                {t('createFirstPage')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPages.map((page) => (
            <Card key={page.id} className="overflow-hidden">
              {/* Cover Image */}
              {page.coverImage ? (
                <div className="relative w-full h-40">
                  <Image
                    src={page.coverImage}
                    alt={page.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5" />
              )}

              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link href={`/hub/pages/${page.id}`}>
                      <h3 className="font-semibold text-xl truncate hover:underline text-start">
                        {page.name}
                        {page.isVerified && (
                          <CheckCircle2 className="inline h-5 w-5 text-blue-500 ms-1" />
                        )}
                      </h3>
                    </Link>
                    <Badge variant="secondary" className="mt-2">
                      {page.category}
                    </Badge>
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
                        {t('editPage')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="me-2 h-4 w-4" />
                        {t('pageSettings')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TrendingUp className="me-2 h-4 w-4" />
                        {t('viewInsights')}
                      </DropdownMenuItem>
                      {!page.isVerified && (
                        <DropdownMenuItem>
                          <CheckCircle2 className="me-2 h-4 w-4" />
                          {t('requestVerification')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeletePageId(page.id)}
                      >
                        <Trash2 className="me-2 h-4 w-4" />
                        {t('deletePage')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {page.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 text-start mt-2">
                    {page.description}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-start">{page.followerCount}</div>
                    <div className="text-xs text-muted-foreground text-start">{t('followers')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-start">{page.likeCount}</div>
                    <div className="text-xs text-muted-foreground text-start">{t('likes')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-start">{page.postCount}</div>
                    <div className="text-xs text-muted-foreground text-start">{t('posts')}</div>
                  </div>
                </div>

                <Link href={`/hub/pages/${page.id}`}>
                  <Button variant="outline" className="w-full">
                    {t('managePage')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <CreatePageModal open={showCreateModal} onOpenChange={setShowCreateModal} />

      {/* Delete Confirmation */}
      <AlertDialog open={deletePageId !== null} onOpenChange={() => setDeletePageId(null)}>
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
              onClick={() => deletePageId && handleDelete(deletePageId)}
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
