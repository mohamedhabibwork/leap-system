'use client';

import { useState } from 'react';
import { useInstructorCourses } from '@/lib/hooks/use-instructor-api';
import { CourseStatsCard } from '@/components/instructor/course-stats-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Grid, List } from 'lucide-react';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { Link } from '@/i18n/navigation';

export default function InstructorCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: courses, isLoading } = useInstructorCourses();

  const filteredCourses = courses?.filter((course) =>
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your course performance
          </p>
        </div>
        <Link href="/hub/instructor/courses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </Link>
      </div>

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
      ) : filteredCourses && filteredCourses.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          {filteredCourses.map((course) => (
            <CourseStatsCard key={course.courseId} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'No courses found' : 'No courses yet'}
          </p>
          {!searchQuery && (
            <Link href="/hub/instructor/courses/new">
              <Button variant="link" className="mt-2">
                Create your first course
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
