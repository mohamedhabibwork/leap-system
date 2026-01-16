'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCourses } from '@/lib/hooks/use-api';
import { CourseCard } from '@/components/cards/course-card';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { NoCourses } from '@/components/empty/no-courses';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Grid, List, X, TrendingUp, Clock } from 'lucide-react';
import { AdContainer } from '@/components/ads';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', label: 'All Courses', icon: '📚' },
  { id: 'programming', label: 'Programming', icon: '💻' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'marketing', label: 'Marketing', icon: '📱' },
  { id: 'data-science', label: 'Data Science', icon: '📊' },
];

export default function CoursesPage() {
  const t = useTranslations('courses.list');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const { data: courses, isLoading } = useCourses({
    search: searchQuery,
    category: category !== 'all' ? category : undefined,
    level: level !== 'all' ? level : undefined,
    sortBy,
  });

  // Separate enrolled courses from all courses
  const enrolledCourses = (courses as any)?.filter((c: any) => c.isEnrolled) || [];
  const allCoursesList = courses as any[] || [];

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
    // Reset corresponding filter
    if (filter.startsWith('Category:')) setCategory('all');
    if (filter.startsWith('Level:')) setLevel('all');
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setCategory('all');
    setLevel('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Category Carousel */}
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-4">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={category === cat.id ? 'default' : 'outline'}
                onClick={() => setCategory(cat.id)}
                className="flex-shrink-0 gap-2"
              >
                <span>{cat.icon}</span>
                {t(`category.${cat.id}`)}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Continue Learning Section */}
      {enrolledCourses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">
                {t('continueLearning')}
              </h2>
            </div>
            <Button variant="ghost" size="sm">
              {t('viewAll')}
            </Button>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-6 pb-4">
              {enrolledCourses.slice(0, 4).map((course: any) => (
                <div key={course.id} className="w-80 flex-shrink-0">
                  <CourseCard course={course} variant="grid" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </section>
      )}

      {/* Banner Ad */}
      <AdContainer
        placement="courses_listing_banner"
        type="banner"
        width={728}
        height={90}
        className="mx-auto"
      />

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10 h-11"
            />
          </div>

          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full sm:w-[160px] h-11">
              <SelectValue placeholder={t('level.label')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('level.all')}</SelectItem>
              <SelectItem value="beginner">{t('level.beginner')}</SelectItem>
              <SelectItem value="intermediate">{t('level.intermediate')}</SelectItem>
              <SelectItem value="advanced">{t('level.advanced')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[160px] h-11">
              <SelectValue placeholder={t('sort.label')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t('sort.popular')}
                </div>
              </SelectItem>
              <SelectItem value="newest">{t('sort.newest')}</SelectItem>
              <SelectItem value="price-low">{t('sort.priceLow')}</SelectItem>
              <SelectItem value="price-high">{t('sort.priceHigh')}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-11 w-11"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-11 w-11"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(category !== 'all' || level !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {t('activeFilters')}
            </span>
            {category !== 'all' && (
              <Badge variant="secondary" className="gap-2 pe-2">
                {t(`category.${category}`)}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => setCategory('all')}
                />
              </Badge>
            )}
            {level !== 'all' && (
              <Badge variant="secondary" className="gap-2 pe-2">
                {t('level.label')}: {t(`level.${level}`)}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => setLevel('all')}
                />
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-2 pe-2">
                {t('searchPlaceholder')}: &quot;{searchQuery}&quot;
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => setSearchQuery('')}
                />
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="h-7 text-xs"
            >
              {t('clearAll')}
            </Button>
          </div>
        )}
      </div>

      {/* Results Header */}
      {!isLoading && allCoursesList.length > 0 && (
        <div className="flex items-center justify-between pb-4 border-b">
          <p className="text-sm text-muted-foreground">
            {t('showingResults', { 
              defaultValue: 'Showing {count} courses',
              values: { count: allCoursesList.length.toLocaleString() }
            })}
          </p>
        </div>
      )}

      {/* Courses Grid/List */}
      {isLoading ? (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
            : 'space-y-4'
        )}>
          <CardSkeleton variant={viewMode} count={6} />
        </div>
      ) : allCoursesList.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'space-y-4'
        )}>
          {allCoursesList.map((course: any, index: number) => (
            <React.Fragment key={course.id || `course-${index}`}>
              <CourseCard course={course} variant={viewMode} />
              {/* Insert sponsored course ad after every 8 courses */}
              {(index + 1) % 8 === 0 && viewMode === 'grid' && (
                <AdContainer
                  key={`ad-${course.id || index}`}
                  placement="courses_between_content"
                  type="sponsored"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <NoCourses />
      )}
    </div>
  );
}
