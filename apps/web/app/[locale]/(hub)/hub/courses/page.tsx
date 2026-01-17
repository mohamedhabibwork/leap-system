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
import { Search, Filter, Grid, List, X, TrendingUp, Clock, LayoutGrid, LayoutList, Sparkles } from 'lucide-react';
import { AdContainer } from '@/components/ads';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { LookupTypeCode } from '@leap-lms/shared-types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Fetch lookups for course levels
  const { data: courseLevels } = useLookupsByType(LookupTypeCode.COURSE_LEVEL);

  // Helper function to get lookup label by code
  const getLevelLabel = (code: string): string => {
    if (!courseLevels) return code;
    const level = courseLevels.find((l) => l.code === code);
    return level?.nameEn || code;
  };

  const { data: coursesData, isLoading } = useCourses({
    search: searchQuery,
    category: category !== 'all' ? category : undefined,
    level: level !== 'all' ? level : undefined,
    sortBy,
  });

  // Handle both array and paginated response
  // Backend returns { data: [...], pagination: {...} } or just array
  const courses = Array.isArray(coursesData) 
    ? coursesData 
    : (coursesData )?.data || [];
  
  // Separate enrolled courses from all courses
  const enrolledCourses = Array.isArray(courses) ? courses.filter((c: any) => c.isEnrolled) : [];
  const allCoursesList = Array.isArray(courses) ? courses : [];

  const clearAllFilters = () => {
    setCategory('all');
    setLevel('all');
    setSearchQuery('');
  };

  const hasActiveFilters = category !== 'all' || level !== 'all' || searchQuery;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="px-3 sm:px-4 md:px-6 py-8 sm:py-12 space-y-6">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <Badge variant="secondary" className="text-sm">
                {allCoursesList.length} {t('coursesAvailable', { defaultValue: 'Courses Available' })}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {t('title')}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              {t('description')}
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-11 h-12 text-base"
              />
            </div>
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="h-12 gap-2">
                  <Filter className="h-4 w-4" />
                  {t('filters', { defaultValue: 'Filters' })}
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {(category !== 'all' ? 1 : 0) + (level !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>{t('filters', { defaultValue: 'Filters' })}</SheetTitle>
                  <SheetDescription>
                    {t('filterDescription', { defaultValue: 'Filter courses by category, level, and more' })}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">{t('level.label')}</label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('level.all')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('level.all')}</SelectItem>
                        {courseLevels?.map((courseLevel) => (
                          <SelectItem key={courseLevel.code} value={courseLevel.code}>
                            {courseLevel.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium">{t('sort.label')}</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('sort.popular')} />
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
                  </div>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearAllFilters} className="w-full">
                      {t('clearAll')}
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 md:px-6 py-6 space-y-8">
        {/* Category Carousel */}
        <div className="relative">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-4">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? 'default' : 'outline'}
                  onClick={() => setCategory(cat.id)}
                  className="shrink-0 gap-2 h-10"
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{t(`category.${cat.id}`)}</span>
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
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{t('continueLearning')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {enrolledCourses.length} {t('activeCourses', { defaultValue: 'active courses' })}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                {t('viewAll')}
              </Button>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-6 pb-4">
                {enrolledCourses.slice(0, 4).map((course: any) => (
                  <div key={course.id} className="w-80 shrink-0">
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

        {/* Active Filters & View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {category !== 'all' && (
                <Badge variant="secondary" className="gap-2 pe-2 py-1.5">
                  {t(`category.${category}`)}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                    onClick={() => setCategory('all')}
                  />
                </Badge>
              )}
              {level !== 'all' && (
                <Badge variant="secondary" className="gap-2 pe-2 py-1.5">
                  {t('level.label')}: {getLevelLabel(level)}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                    onClick={() => setLevel('all')}
                  />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-2 pe-2 py-1.5">
                  {t('searchPlaceholder')}: &quot;{searchQuery}&quot;
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
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

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {t('viewMode', { defaultValue: 'View' })}:
            </span>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
                aria-label="List view"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        {!isLoading && allCoursesList.length > 0 && (
          <div className="flex items-center justify-between pb-2 border-b">
            <p className="text-sm font-medium text-muted-foreground">
              {t('showingResults', { 
                count: allCoursesList.length,
                defaultValue: `Showing ${allCoursesList.length} courses`
              })}
            </p>
          </div>
        )}

        {/* Courses Grid/List */}
        {isLoading ? (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'space-y-4'
          )}>
            <CardSkeleton variant={viewMode} count={8} />
          </div>
        ) : allCoursesList.length > 0 ? (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
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
    </div>
  );
}
