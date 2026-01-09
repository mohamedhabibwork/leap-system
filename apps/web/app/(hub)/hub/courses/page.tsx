'use client';

import { useState } from 'react';
import { useCourses } from '@/lib/hooks/use-api';
import { CourseCard } from '@/components/cards/course-card';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { NoCourses } from '@/components/empty/no-courses';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Grid, List } from 'lucide-react';
import { AdContainer } from '@/components/ads';

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: courses, isLoading } = useCourses({
    search: searchQuery,
    category: category !== 'all' ? category : undefined,
    level: level !== 'all' ? level : undefined,
    sortBy,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Courses</h1>
        <p className="text-muted-foreground mt-2">
          Discover and enroll in courses to expand your knowledge
        </p>
      </div>

      {/* Banner Ad */}
      <AdContainer
        placement="courses_listing_banner"
        type="banner"
        width={728}
        height={90}
        className="mx-auto"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="programming">Programming</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Courses Grid/List */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          <CardSkeleton variant={viewMode} count={6} />
        </div>
      ) : courses && (courses as any).length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          {(courses as any).map((course: any, index: number) => (
            <>
              <CourseCard key={course.id} course={course} variant={viewMode} />
              {/* Insert sponsored course ad after every 6 courses */}
              {(index + 1) % 6 === 0 && viewMode === 'grid' && (
                <AdContainer
                  key={`ad-${index}`}
                  placement="courses_between_content"
                  type="sponsored"
                />
              )}
            </>
          ))}
        </div>
      ) : (
        <NoCourses />
      )}
    </div>
  );
}
