'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MessageSquare, Send, Bell, Mail, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  useInstructorCourses,
  useCreateAnnouncement,
  useAnnouncements,
  useCourseStudents,
  useSendMessageToStudent,
} from '@/lib/hooks/use-instructor-api';
import { useDashboardUIStore, selectModalState } from '@/stores/dashboard-ui.store';
import { PageLoader } from '@/components/loading/page-loader';

export default function InstructorCommunicationPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState('');

  const { openModal, closeModal } = useDashboardUIStore();
  const isAnnouncementOpen = useDashboardUIStore(selectModalState('create-announcement'));
  const isMessageOpen = useDashboardUIStore(selectModalState('send-message'));

  const { data: coursesResponse, isLoading: coursesLoading } = useInstructorCourses();
  const { data: announcementsResponse, isLoading: announcementsLoading } = useAnnouncements(
    selectedCourseId || 0
  );
  const { data: studentsResponse } = useCourseStudents(selectedCourseId || 0);

  const createAnnouncement = useCreateAnnouncement();
  const sendMessage = useSendMessageToStudent();

  const courses = coursesResponse?.data || [];
  const announcements = announcementsResponse?.data || [];
  const students = studentsResponse?.data || [];

  const handleCreateAnnouncement = () => {
    if (!selectedCourseId) {
      toast.error('Please select a course');
      return;
    }
    if (!announcementTitle || !announcementContent) {
      toast.error('Please fill in all fields');
      return;
    }

    createAnnouncement.mutate(
      {
        courseId: selectedCourseId,
        data: {
          title: announcementTitle,
          content: announcementContent,
        },
      },
      {
        onSuccess: () => {
          toast.success('Announcement created successfully');
          setAnnouncementTitle('');
          setAnnouncementContent('');
          closeModal('create-announcement');
        },
        onError: () => {
          toast.error('Failed to create announcement');
        },
      }
    );
  };

  const handleSendMessage = () => {
    if (!selectedStudentId) {
      toast.error('Please select a student');
      return;
    }
    if (!messageContent) {
      toast.error('Please enter a message');
      return;
    }

    sendMessage.mutate(
      {
        studentId: selectedStudentId,
        message: messageContent,
      },
      {
        onSuccess: () => {
          toast.success('Message sent successfully');
          setMessageContent('');
          setSelectedStudentId(null);
          closeModal('send-message');
        },
        onError: () => {
          toast.error('Failed to send message');
        },
      }
    );
  };

  if (coursesLoading) {
    return <PageLoader message="Loading communication tools..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communication Hub</h1>
          <p className="text-muted-foreground mt-2">
            Communicate with your students and send announcements
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openModal('create-announcement')}>
            <Bell className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
          <Button variant="outline" onClick={() => openModal('send-message')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
          <CardDescription>Choose a course to view and manage communications</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedCourseId?.toString()}
            onValueChange={(value) => setSelectedCourseId(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course: any) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCourseId && (
        <Tabs defaultValue="announcements">
          <TabsList>
            <TabsTrigger value="announcements">
              <Bell className="mr-2 h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="mr-2 h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Announcements</CardTitle>
                <CardDescription>
                  All students enrolled in this course will receive these announcements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {announcementsLoading ? (
                  <p className="text-center text-muted-foreground py-8">
                    Loading announcements...
                  </p>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No announcements yet</p>
                    <Button
                      onClick={() => openModal('create-announcement')}
                      className="mt-4"
                      variant="outline"
                    >
                      Create First Announcement
                    </Button>
                  </div>
                ) : (
                  announcements.map((announcement: any) => (
                    <div
                      key={announcement.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {announcement.content}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>Sent to {announcement.recipientCount || 0} students</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>Students in this course</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No students enrolled yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student: any) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            {new Date(student.enrolledAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${student.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {student.progress || 0}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStudentId(student.id);
                                openModal('send-message');
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Your conversation history with students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Message history coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Create Announcement Dialog */}
      <Dialog open={isAnnouncementOpen} onOpenChange={() => closeModal('create-announcement')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>
              Send an announcement to all students in the selected course
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-course">Course</Label>
              <Select
                value={selectedCourseId?.toString()}
                onValueChange={(value) => setSelectedCourseId(Number(value))}
              >
                <SelectTrigger id="announcement-course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                placeholder="Announcement title"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-content">Content</Label>
              <Textarea
                id="announcement-content"
                placeholder="Write your announcement here..."
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('create-announcement')}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAnnouncement}
              disabled={createAnnouncement.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {createAnnouncement.isPending ? 'Sending...' : 'Send Announcement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={isMessageOpen} onOpenChange={() => closeModal('send-message')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>Send a direct message to a student</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message-student">Student</Label>
              <Select
                value={selectedStudentId?.toString()}
                onValueChange={(value) => setSelectedStudentId(Number(value))}
              >
                <SelectTrigger id="message-student">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student: any) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.firstName} {student.lastName} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                placeholder="Write your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('send-message')}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={sendMessage.isPending}>
              <Send className="mr-2 h-4 w-4" />
              {sendMessage.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
