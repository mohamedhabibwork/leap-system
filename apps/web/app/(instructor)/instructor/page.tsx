'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseCard } from '@/components/cards/course-card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Award, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCourses } from '@/lib/hooks/use-api';

const stats = [
  {
    title: 'My Courses',
    value: '12',
    change: '+2 this month',
    icon: BookOpen,
    color: 'text-blue-500',
  },
  {
    title: 'Total Students',
    value: '1,543',
    change: '+123 this month',
    icon: Users,
    color: 'text-green-500',
  },
  {
    title: 'Avg. Rating',
    value: '4.8',
    change: '+0.2 from last month',
    icon: Award,
    color: 'text-yellow-500',
  },
  {
    title: 'Course Completions',
    value: '456',
    change: '+34 this month',
    icon: TrendingUp,
    color: 'text-purple-500',
  },
];

export default function InstructorDashboard() {
  const { data: courses, isLoading } = useCourses({ instructorId: 1 }); // Replace with actual instructor ID

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your courses and students
          </p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* My Courses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Courses</CardTitle>
            <Button variant="outline" asChild>
              <Link href="/instructor/courses">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading courses...</p>
          ) : courses && courses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 3).map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
              <p className="text-muted-foreground mt-2">
                Create your first course to get started
              </p>
              <Button className="mt-4" asChild>
                <Link href="/instructor/courses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Items */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Grading</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              5 assignments need your review
            </p>
            <Button variant="link" className="px-0" asChild>
              <Link href="/instructor/grading">Review Now →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              12 unanswered questions from students
            </p>
            <Button variant="link" className="px-0" asChild>
              <Link href="/instructor/questions">Answer Questions →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
