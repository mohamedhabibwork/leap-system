'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Mail, Download, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { format } from 'date-fns';

interface Student {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  enrolledAt: string;
  courseId: number;
  courseName: string;
  progress: number;
}

export default function InstructorStudentsPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('');

  const { data: students, isLoading } = useQuery({
    queryKey: ['instructor-students', user?.id, courseFilter],
    queryFn: async () => {
      if (!user?.id) return { data: [], total: 0 };
      const courseParam = courseFilter ? `?courseId=${courseFilter}` : '';
      return await apiClient.get(`/users/instructor/${user.id}/students${courseParam}`);
    },
    enabled: !!user?.id,
  });

  const filteredStudents = (students as any)?.data?.filter((student: Student) => {
    if (!searchQuery) return true;
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.username.toLowerCase().includes(query)
    );
  });

  const handleExportCSV = () => {
    if (!filteredStudents || filteredStudents.length === 0) return;

    const headers = ['Name', 'Email', 'Username', 'Course', 'Progress', 'Enrolled Date'];
    const rows = filteredStudents.map((student: Student) => [
      `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      student.email,
      student.username,
      student.courseName,
      `${student.progress}%`,
      format(new Date(student.enrolledAt), 'yyyy-MM-dd'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Extract unique courses for filter
  const courses = (students as any)?.data
    ? Array.from(
        new Map(((students as any).data as Student[]).map((s: Student) => [s.courseId, { id: s.courseId, name: s.courseName }])).values()
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
        <p className="text-muted-foreground mt-2">View and manage students enrolled in your courses</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student List</CardTitle>
              <CardDescription>
                {(students as any)?.total || 0} students currently enrolled in your courses
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleExportCSV} disabled={!filteredStudents?.length}>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {courses && courses.length > 1 && (
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Courses</SelectItem>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : filteredStudents && filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student: Student) => {
                  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.username;
                  const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase() || student.username[0].toUpperCase();

                  return (
                    <TableRow key={`${student.id}-${student.courseId}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={student.avatarUrl} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{fullName}</div>
                            <div className="text-sm text-muted-foreground">@{student.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.courseName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${student.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-10">
                            {student.progress || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(student.enrolledAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" title="Contact student">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? 'No students found matching your search.' : 'No students enrolled yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
