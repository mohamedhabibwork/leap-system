'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { EventCard } from '@/components/cards/event-card';
import { JobCard } from '@/components/cards/job-card';
import { CourseCard } from '@/components/cards/course-card';
import { GroupCard } from '@/components/cards/group-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvents, useJobs, useCourses, useGroups, useTrendingSearches } from '@/lib/hooks/use-api';
import Image from 'next/image';

/**
 * Discovery Page
 * Displays trending content, recommendations, and featured items
 * 
 * RTL/LTR Support:
 * - All text aligned with text-start
 * - Grids and cards flow correctly in both directions
 * - Icons positioned with logical spacing
 * - Tabs and navigation work bidirectionally
 * 
 * Theme Support:
 * - Cards and backgrounds adapt to theme
 * - Text colors use theme-aware classes
 * - Badges and accents work in both themes
 * - Loading states visible in both themes
 */
export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('trending');

  // Fetch data for different tabs
  const { data: eventsData, isLoading: isLoadingEvents } = useEvents({ limit: 6, featured: true });
  const { data: jobsData, isLoading: isLoadingJobs } = useJobs({ limit: 5, featured: true });
  const { data: coursesData, isLoading: isLoadingCourses } = useCourses({ limit: 6, sortBy: 'popular' });
  const { data: groupsData, isLoading: isLoadingGroups } = useGroups();
  const { data: trendingData, isLoading: isLoadingTrending } = useTrendingSearches(5);

  const events = (eventsData as any) || [];
  const jobs = (jobsData as any) || [];
  const courses = (coursesData as any) || [];
  const groups = (groupsData as any) || [];
  const trendingTopics = trendingData?.data || trendingData || [];

  return (
    <div className="container max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Discover
          </h1>
          <p className="text-muted-foreground mt-2 text-start text-sm sm:text-base">
            Explore trending content and personalized recommendations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Trending</span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Groups</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Courses</span>
          </TabsTrigger>
        </TabsList>

        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Featured Events */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-start flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Featured Events
                    </CardTitle>
                    <Link href="/hub/events">
                      <Button variant="ghost" size="sm" className="gap-2">
                        View all
                        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {isLoadingEvents ? (
                      <DiscoverySkeleton type="event" />
                    ) : events.length > 0 ? (
                      events.slice(0, 2).map((event: any) => (
                        <EventCard key={event.id} event={event} />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No featured events available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Featured Jobs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-start flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Hot Jobs
                    </CardTitle>
                    <Link href="/hub/jobs">
                      <Button variant="ghost" size="sm" className="gap-2">
                        View all
                        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingJobs ? (
                      <DiscoverySkeleton type="job" />
                    ) : jobs.length > 0 ? (
                      jobs.slice(0, 3).map((job: any) => (
                        <JobCard key={job.id} job={job} />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hot jobs available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1/3 */}
            <div className="space-y-6">
              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-start">
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isLoadingTrending ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center gap-3 p-3">
                              <Skeleton className="w-8 h-8 rounded-full" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : trendingTopics.length > 0 ? (
                      trendingTopics.map((topic: any, i: number) => {
                        const topicName = topic.query || topic.name || topic;
                        return (
                          <Link
                            key={topic.id || topicName || i}
                            href={`/hub/search?q=${encodeURIComponent(topicName)}`}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                {i + 1}
                              </div>
                              <div className="text-start">
                                <p className="font-medium group-hover:text-primary transition-colors">
                                  #{topicName}
                                </p>
                                {topic.count && (
                                  <p className="text-xs text-muted-foreground">
                                    {topic.count}+ posts
                                  </p>
                                )}
                              </div>
                            </div>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No trending topics available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Groups */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-start">
                    Suggested Groups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isLoadingGroups ? (
                      <DiscoverySkeleton type="group-small" />
                    ) : groups.length > 0 ? (
                      groups.slice(0, 3).map((group: any) => (
                        <Link
                          key={group.id}
                          href={`/hub/social/groups/${group.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                            {group.coverImage ? (
                              <Image
                                src={group.coverImage}
                                alt={group.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-start">
                            <p className="font-medium group-hover:text-primary transition-colors truncate">
                              {group.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {group.memberCount || 0} members
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No suggested groups available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-start">Suggested Groups</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingGroups ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <DiscoverySkeleton type="group" count={6} />
                </div>
              ) : groups.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {groups.map((group: any) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No groups available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-start">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <DiscoverySkeleton type="event" count={6} />
                </div>
              ) : events.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event: any) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No upcoming events available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-start">Recommended Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingJobs ? (
                <div className="space-y-4">
                  <DiscoverySkeleton type="job" count={5} />
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job: any) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recommended jobs available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-start">Popular Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCourses ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <DiscoverySkeleton type="course" count={6} />
                </div>
              ) : courses.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course: any) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No popular courses available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DiscoverySkeleton({ type, count = 3 }: { type: string; count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          {type === 'group-small' ? (
            <div className="flex items-center gap-3 p-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ) : type === 'event' ? (
            <div className="space-y-3">
              <Skeleton className="w-full h-48 rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : type === 'job' ? (
            <div className="flex gap-4 p-4 border border-border rounded-lg">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Skeleton className="w-full h-48 rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
        </div>
      ))}
    </>
  );
}
