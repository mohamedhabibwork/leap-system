'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFavorites, useFavoritesByType } from '@/lib/hooks/use-api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { EmptyState } from '@/components/empty/empty-state';
import { Heart, BookOpen, Calendar, Users, FileText, User } from 'lucide-react';
import { EventCard } from '@/components/cards/event-card';
import { CourseCard } from '@/components/cards/course-card';
import { GroupCard } from '@/components/cards/group-card';
import { PageCard } from '@/components/cards/page-card';
import { UserCard } from '@/components/cards/user-card';
import { Card, CardContent } from '@/components/ui/card';

/**
 * My Favorites Page
 * Display all favorited items organized by type
 * 
 * RTL/LTR Support:
 * - All content respects reading direction
 * - Tabs and cards flow correctly
 * 
 * Theme Support:
 * - Adapts to light/dark theme
 */
export default function FavoritesPage() {
  const t = useTranslations('favorites');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch all favorites or by type
  const { data: allFavoritesData, isLoading: isLoadingAll } = useFavorites(
    activeTab === 'all' ? { page, limit } : undefined
  );
  const { data: typeFavoritesData, isLoading: isLoadingType } = useFavoritesByType(
    activeTab !== 'all' ? activeTab : '',
    activeTab !== 'all' ? { page, limit } : undefined
  );

  const isLoading = activeTab === 'all' ? isLoadingAll : isLoadingType;
  const favoritesData = activeTab === 'all' ? allFavoritesData : typeFavoritesData;

  const favorites = favoritesData?.data || [];
  const pagination = favoritesData?.pagination;

  const renderFavoriteItem = (item: any, type: string) => {
    switch (type) {
      case 'event':
        return <EventCard key={item.id} event={item} />;
      case 'course':
        return <CourseCard key={item.id} course={item} />;
      case 'group':
        return <GroupCard key={item.id} group={item} />;
      case 'page':
        return <PageCard key={item.id} page={item} />;
      case 'user':
        return <UserCard key={item.id} user={item} />;
      case 'post':
        return (
          <Card key={item.id} className="p-4">
            <CardContent>
              <p className="text-start">{item.content}</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  const getEmptyState = (type: string) => {
    const emptyStates: Record<string, { icon: any; title: string; description: string }> = {
      all: {
        icon: Heart,
        title: t('empty.all.title'),
        description: t('empty.all.description'),
      },
      event: {
        icon: Calendar,
        title: t('empty.event.title'),
        description: t('empty.event.description'),
      },
      course: {
        icon: BookOpen,
        title: t('empty.course.title'),
        description: t('empty.course.description'),
      },
      group: {
        icon: Users,
        title: t('empty.group.title'),
        description: t('empty.group.description'),
      },
      page: {
        icon: FileText,
        title: t('empty.page.title'),
        description: t('empty.page.description'),
      },
      user: {
        icon: User,
        title: t('empty.user.title'),
        description: t('empty.user.description'),
      },
      post: {
        icon: Heart,
        title: t('empty.post.title'),
        description: t('empty.post.description'),
      },
    };

    return emptyStates[type] || emptyStates.all;
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-start">
          {t('title')}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground text-start">
          {t('description')}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="all">{t('tabs.all')}</TabsTrigger>
          <TabsTrigger value="event">{t('tabs.events')}</TabsTrigger>
          <TabsTrigger value="course">{t('tabs.courses')}</TabsTrigger>
          <TabsTrigger value="group">{t('tabs.groups')}</TabsTrigger>
          <TabsTrigger value="page">{t('tabs.pages')}</TabsTrigger>
          <TabsTrigger value="user">{t('tabs.users')}</TabsTrigger>
          <TabsTrigger value="post">{t('tabs.posts')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              <CardSkeleton variant="grid" count={6} />
            </div>
          ) : favorites.length > 0 ? (
            <>
              {activeTab === 'all' ? (
                <div className="space-y-6">
                  {favorites.map((item: any) => (
                    <div key={`${item.type}-${item.entity?.id || item.favorite?.favoritableId}`}>
                      {renderFavoriteItem(item.entity || item, item.type)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {favorites.map((item: any) => renderFavoriteItem(item, activeTab))}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={getEmptyState(activeTab).icon}
              title={getEmptyState(activeTab).title}
              description={getEmptyState(activeTab).description}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
