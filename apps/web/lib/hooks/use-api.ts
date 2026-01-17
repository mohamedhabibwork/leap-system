import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '../api/client';
import { mediaAPI } from '../api/media';
import { groupsAPI, pagesAPI, postsAPI, chatAPI } from '../api';
import { toast } from 'sonner';

// Posts with infinite scroll
export function useInfinitePosts(params?: any) {
  return useInfiniteQuery({
    queryKey: ['posts', params],
    queryFn: ({ pageParam = 1 }) =>
      postsAPI.getAll({ ...params, page: pageParam }).then(res => {
        const data = (res as any).data || res;
        return data;
      }),
    getNextPageParam: (lastPage: any) => {
      // API returns { data: [...], pagination: { page, totalPages, ... } }
      const pagination = lastPage?.pagination;
      if (!pagination || pagination.page >= pagination.totalPages) {
        return undefined; // No more pages
      }
      return pagination.page + 1; // Return next page number
    },
    initialPageParam: 1,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => postsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Comments
export function useComments(entityType: string, entityId: number) {
  return useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: () => apiClient.get<any[]>(`/comments/by-commentable?type=${entityType}&id=${entityId}`),
    enabled: !!entityType && !!entityId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post('/comments', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.commentableType, variables.commentableId],
      });
    },
  });
}

// Notes
export function useNotes(entityType: string, entityId: number) {
  return useQuery({
    queryKey: ['notes', entityType, entityId],
    queryFn: () => apiClient.get<any[]>(`/notes/my-notes?type=${entityType}&id=${entityId}`),
    enabled: !!entityType && !!entityId,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ============================================
// EVENTS HOOKS
// ============================================
import { eventsAPI, type Event, type EventRegistration, type CreateEventDto, type UpdateEventDto, type RegisterEventDto } from '../api/events';

// Events Queries
export function useEvents(params?: any) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      try {
        const events = await eventsAPI.getAll(params);
        return Array.isArray(events) ? events : [];
      } catch (error) {
        console.error('Error fetching events:', error);
        return [];
      }
    },
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      try {
        const event = await eventsAPI.getById(id);
        return event ?? null;
      } catch (error) {
        console.error('Error fetching event:', error);
        return null;
      }
    },
    enabled: !!id,
  });
}

export function useEventRegistrations(id: number, params?: any) {
  return useQuery({
    queryKey: ['events', id, 'registrations', params],
    queryFn: async () => {
      try {
        const registrations = await eventsAPI.getRegistrations(id, params);
        return Array.isArray(registrations) ? registrations : [];
      } catch (error) {
        console.error('Error fetching event registrations:', error);
        return [];
      }
    },
    enabled: !!id,
  });
}

export function useMyEvents(params?: any) {
  return useQuery({
    queryKey: ['events', 'my-events', params],
    queryFn: async () => {
      try {
        const events = await eventsAPI.getMyEvents(params);
        return Array.isArray(events) ? events : [];
      } catch (error) {
        console.error('Error fetching my events:', error);
        return [];
      }
    },
  });
}

export function useMyEventRegistrations(params?: any) {
  return useQuery({
    queryKey: ['events', 'my-registrations', params],
    queryFn: async () => {
      try {
        const registrations = await eventsAPI.getMyRegistrations(params);
        return Array.isArray(registrations) ? registrations : [];
      } catch (error) {
        console.error('Error fetching my event registrations:', error);
        return [];
      }
    },
  });
}

// Events Mutations
export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventDto) => eventsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully');
    },
    onError: () => {
      toast.error('Failed to create event');
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEventDto }) => 
      eventsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
      toast.success('Event updated successfully');
    },
    onError: () => {
      toast.error('Failed to update event');
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eventsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete event');
    },
  });
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RegisterEventDto }) => 
      eventsAPI.register(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-registrations'] });
      toast.success('Registration updated successfully');
    },
    onError: () => {
      toast.error('Failed to update registration');
    },
  });
}

export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RegisterEventDto }) => 
      eventsAPI.updateRegistrationStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-registrations'] });
      toast.success('Registration status updated');
    },
    onError: () => {
      toast.error('Failed to update registration status');
    },
  });
}

export function useUnregisterFromEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eventsAPI.unregister(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-registrations'] });
      toast.success('Unregistered from event');
    },
    onError: () => {
      toast.error('Failed to unregister from event');
    },
  });
}

export function useFeatureEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eventsAPI.feature(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event featured');
    },
    onError: () => {
      toast.error('Failed to feature event');
    },
  });
}

export function useUnfeatureEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eventsAPI.unfeature(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event unfeatured');
    },
    onError: () => {
      toast.error('Failed to unfeature event');
    },
  });
}

// ============================================
// JOBS HOOKS
// ============================================
import { jobsAPI, type Job, type JobApplication, type CreateJobDto, type UpdateJobDto, type ApplyJobDto, type UpdateApplicationStatusDto } from '../api/jobs';

// Jobs Queries
export function useJobs(params?: any) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: async () => {
      try {
        const jobs = await jobsAPI.getAll(params);
        return Array.isArray(jobs) ? jobs : [];
      } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
      }
    },
  });
}

export function useJob(id: number) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: async () => {
      try {
        const job = await jobsAPI.getById(id);
        return job ?? null;
      } catch (error) {
        console.error('Error fetching job:', error);
        return null;
      }
    },
    enabled: !!id,
  });
}

export function useJobApplications(id: number, params?: any) {
  return useQuery({
    queryKey: ['jobs', id, 'applications', params],
    queryFn: async () => {
      try {
        const applications = await jobsAPI.getApplications(id, params);
        return Array.isArray(applications) ? applications : [];
      } catch (error) {
        console.error('Error fetching job applications:', error);
        return [];
      }
    },
    enabled: !!id,
  });
}

export function useMyJobs(params?: any) {
  return useQuery({
    queryKey: ['jobs', 'my-jobs', params],
    queryFn: async () => {
      try {
        const jobs = await jobsAPI.getMyJobs(params);
        return Array.isArray(jobs) ? jobs : [];
      } catch (error) {
        console.error('Error fetching my jobs:', error);
        return [];
      }
    },
  });
}

export function useMyJobApplications(params?: any) {
  return useQuery({
    queryKey: ['jobs', 'my-applications', params],
    queryFn: async () => {
      try {
        const applications = await jobsAPI.getMyApplications(params);
        return Array.isArray(applications) ? applications : [];
      } catch (error) {
        console.error('Error fetching my job applications:', error);
        return [];
      }
    },
  });
}

export function useSavedJobs(params?: any) {
  return useQuery({
    queryKey: ['jobs', 'saved', params],
    queryFn: async () => {
      try {
        const jobs = await jobsAPI.getSavedJobs(params);
        return Array.isArray(jobs) ? jobs : [];
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
        return [];
      }
    },
  });
}

// Jobs Mutations
export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobDto) => jobsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job posted successfully');
    },
    onError: () => {
      toast.error('Failed to post job');
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateJobDto }) => 
      jobsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', variables.id] });
      toast.success('Job updated successfully');
    },
    onError: () => {
      toast.error('Failed to update job');
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete job');
    },
  });
}

export function useApplyForJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApplyJobDto }) => 
      jobsAPI.apply(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', 'my-applications'] });
      toast.success('Application submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit application');
    },
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobsAPI.save(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', 'saved'] });
      toast.success('Job saved');
    },
    onError: () => {
      toast.error('Failed to save job');
    },
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobsAPI.unsave(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', 'saved'] });
      toast.success('Job removed from saved');
    },
    onError: () => {
      toast.error('Failed to remove saved job');
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, applicationId, data }: { jobId: number; applicationId: number; data: UpdateApplicationStatusDto }) => 
      jobsAPI.updateApplicationStatus(jobId, applicationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', variables.jobId, 'applications'] });
      toast.success('Application status updated');
    },
    onError: () => {
      toast.error('Failed to update application status');
    },
  });
}

export function useFeatureJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobsAPI.feature(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job featured');
    },
    onError: () => {
      toast.error('Failed to feature job');
    },
  });
}

export function useUnfeatureJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobsAPI.unfeature(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job unfeatured');
    },
    onError: () => {
      toast.error('Failed to unfeature job');
    },
  });
}

// ============================================
// COURSES HOOKS
// ============================================
import { coursesAPI, type Course, type CourseLesson, type Enrollment, type CourseReview, type CreateCourseDto, type UpdateCourseDto, type EnrollCourseDto, type SubmitReviewDto } from '../api/courses';

// Courses Queries
export function useCourses(params?: any) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      try {
        const courses = await coursesAPI.getAll(params);
        return Array.isArray(courses) ? courses : (courses as any)?.data || [];
      } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
      }
    },
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: async () => {
      try {
        // API client already returns response.data directly
        const course = await coursesAPI.getById(id);
        return course ?? null;
      } catch (error) {
        console.error('Error fetching course:', error);
        return null;
      }
    },
    enabled: !!id,
  });
}

export function useCourseLessons(id: number, params?: any) {
  return useQuery({
    queryKey: ['courses', id, 'lessons', params],
    queryFn: async () => {
      try {
        // API client already returns response.data directly
        const lessons = await coursesAPI.getLessons(id, params);
        return Array.isArray(lessons) ? lessons : [];
      } catch (error) {
        console.error('Error fetching course lessons:', error);
        return [];
      }
    },
    enabled: !!id,
  });
}

export function useCourseLesson(courseId: number, lessonId: number) {
  return useQuery({
    queryKey: ['courses', courseId, 'lessons', lessonId],
    queryFn: async () => {
      try {
        const lesson = await coursesAPI.getLesson(courseId, lessonId);
        return lesson ?? null;
      } catch (error) {
        console.error('Error fetching course lesson:', error);
        return null;
      }
    },
    enabled: !!courseId && !!lessonId,
  });
}

export function useCourseProgress(id: number) {
  return useQuery({
    queryKey: ['courses', id, 'progress'],
    queryFn: async () => {
      try {
        const progress = await coursesAPI.getProgress(id);
        return progress ?? null;
      } catch (error) {
        console.error('Error fetching course progress:', error);
        return null;
      }
    },
    enabled: !!id,
  });
}

export function useMyEnrollments(params?: any) {
  return useQuery({
    queryKey: ['courses', 'my-enrollments', params],
    queryFn: () => coursesAPI.getMyEnrollments(params),
  });
}

// Alias for useMyEnrollments
export const useEnrollments = useMyEnrollments;

export function useMyCourses(params?: any) {
  return useQuery({
    queryKey: ['courses', 'my-courses', params],
    queryFn: async () => {
      try {
        const courses = await coursesAPI.getMyCourses(params);
        return Array.isArray(courses) ? courses : [];
      } catch (error) {
        console.error('Error fetching my courses:', error);
        return [];
      }
    },
  });
}

export function useCourseReviews(id: number, params?: any) {
  return useQuery({
    queryKey: ['courses', id, 'reviews', params],
    queryFn: async () => {
      try {
        // API client already returns response.data directly
        const reviews = await coursesAPI.getReviews(id, params);
        return Array.isArray(reviews) ? reviews : [];
      } catch (error) {
        console.error('Error fetching course reviews:', error);
        return [];
      }
    },
    enabled: !!id,
  });
}

// Courses Mutations
export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourseDto) => coursesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully');
    },
    onError: () => {
      toast.error('Failed to create course');
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseDto }) => 
      coursesAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
      toast.success('Course updated successfully');
    },
    onError: () => {
      toast.error('Failed to update course');
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => coursesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete course');
    },
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: EnrollCourseDto }) => 
      coursesAPI.enroll(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'my-enrollments'] });
      toast.success('Enrolled in course successfully');
    },
    onError: () => {
      toast.error('Failed to enroll in course');
    },
  });
}

// Alias for useEnrollCourse
export const useCreateEnrollment = useEnrollCourse;

export function useUnenrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => coursesAPI.unenroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['courses', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'my-enrollments'] });
      toast.success('Unenrolled from course');
    },
    onError: () => {
      toast.error('Failed to unenroll from course');
    },
  });
}

export function useMarkLessonComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: number; lessonId: number }) => 
      coursesAPI.markLessonComplete(courseId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'lessons'] });
      queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'progress'] });
      toast.success('Lesson marked as complete');
    },
    onError: () => {
      toast.error('Failed to mark lesson as complete');
    },
  });
}

export function useSubmitCourseReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubmitReviewDto }) => 
      coursesAPI.submitReview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', variables.id, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
      toast.success('Review submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit review');
    },
  });
}

export function useUpdateCourseReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, reviewId, data }: { courseId: number; reviewId: number; data: SubmitReviewDto }) => 
      coursesAPI.updateReview(courseId, reviewId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'reviews'] });
      toast.success('Review updated successfully');
    },
    onError: () => {
      toast.error('Failed to update review');
    },
  });
}

export function useDeleteCourseReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, reviewId }: { courseId: number; reviewId: number }) => 
      coursesAPI.deleteReview(courseId, reviewId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'reviews'] });
      toast.success('Review deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete review');
    },
  });
}

export function useFeatureCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => coursesAPI.feature(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['courses', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course featured');
    },
    onError: () => {
      toast.error('Failed to feature course');
    },
  });
}

export function useUnfeatureCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => coursesAPI.unfeature(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['courses', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course unfeatured');
    },
    onError: () => {
      toast.error('Failed to unfeature course');
    },
  });
}

// Groups
export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsAPI.getAll().then(res => (res as any).data || res),
  });
}

// Favorites
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { entityType: string; entityId: number }) =>
      apiClient.post('/favorites/toggle', {
        favoritableId: data.entityId,
        favoritableType: data.entityType,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

// Shares
export function useCreateShare() {
  return useMutation({
    mutationFn: (data: { entityType: string; entityId: number; shareType: string }) =>
      apiClient.post('/shares', data),
  });
}

// ============================================
// NOTIFICATIONS HOOKS
// ============================================
import { notificationsAPI, type Notification, type NotificationPreferences } from '../api/notifications';
import { useEffect, useState } from 'react';
import { notificationsWS } from '../websocket/notifications';

// Notifications Queries
export function useNotifications(params?: any) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      try {
        const notifications = await notificationsAPI.getAll();
        return Array.isArray(notifications) ? notifications : [];
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
  });
}

export function useNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const result = await notificationsAPI.getUnreadCount();
        return result ?? { count: 0 };
      } catch (error) {
        console.error('Error fetching notification count:', error);
        return { count: 0 };
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      try {
        const preferences = await notificationsAPI.getPreferences();
        return preferences ?? null;
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        return null;
      }
    },
  });
}

// Notifications Mutations
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark notifications as read');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
    onError: () => {
      toast.error('Failed to delete notification');
    },
  });
}

export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsAPI.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications deleted');
    },
    onError: () => {
      toast.error('Failed to delete notifications');
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences: Partial<NotificationPreferences>) => 
      notificationsAPI.updatePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
      toast.success('Notification preferences updated');
    },
    onError: () => {
      toast.error('Failed to update preferences');
    },
  });
}

// WebSocket integration hook
export function useNotificationsWebSocket(enabled: boolean = true) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Connect to WebSocket
    // Note: You'll need to get the auth token from your auth system
    // const session = await getSession();
    // if (session?.accessToken) {
    //   notificationsWS.connect(session.accessToken);
    // }

    // Subscribe to connection changes
    const unsubscribeConnection = notificationsWS.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Subscribe to incoming notifications
    const unsubscribeNotifications = notificationsWS.onNotification((notification) => {
      // Invalidate notifications queries to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Show toast notification if in-app notifications are enabled
      if (notification.type !== 'read') {
        // You can customize this based on notification type
        toast.info(notification.title, {
          description: notification.message,
        });
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribeConnection();
      unsubscribeNotifications();
    };
  }, [enabled, queryClient]);

  return { isConnected };
}

// ============================================
// SEARCH HOOKS
// ============================================
import { searchAPI, type SearchParams, type SearchSuggestion } from '../api/search';

// Search Queries
export function useGlobalSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: async () => {
      try {
        const result = await searchAPI.search(params);
        return result ?? null;
      } catch (error) {
        console.error('Error fetching search results:', error);
        return null;
      }
    },
    enabled: !!params.query && params.query.length >= 2,
  });
}

export function useSearchSuggestions(query: string, limit = 10) {
  return useQuery({
    queryKey: ['search', 'suggestions', query, limit],
    queryFn: async () => {
      try {
        const suggestions = await searchAPI.getSuggestions(query, limit);
        return Array.isArray(suggestions) ? suggestions : [];
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        return [];
      }
    },
    enabled: !!query && query.length >= 2,
    staleTime: 60000, // Cache for 1 minute
  });
}

export function useTrendingSearches(limit = 10) {
  return useQuery({
    queryKey: ['search', 'trending', limit],
    queryFn: async () => {
      try {
        const suggestions = await searchAPI.getTrending(limit);
        return Array.isArray(suggestions) ? suggestions : [];
      } catch (error) {
        console.error('Error fetching trending searches:', error);
        return [];
      }
    },
    staleTime: 300000, // Cache for 5 minutes
  });
}

export function useRecentSearches(limit = 10) {
  return useQuery({
    queryKey: ['search', 'recent', limit],
    queryFn: async () => {
      try {
        const suggestions = await searchAPI.getRecentSearches(limit);
        return Array.isArray(suggestions) ? suggestions : [];
      } catch (error) {
        console.error('Error fetching recent searches:', error);
        return [];
      }
    },
  });
}

// ============================================
// STORIES HOOKS
// ============================================
import { storiesAPI, type Story, type CreateStoryDto } from '../api/stories';
import { GroupMember } from '../api';
import { PaginatedResponse } from '@leap-lms/shared-types';

// Stories Queries
export function useStories(params?: any) {
  return useQuery({
    queryKey: ['stories', params],
    queryFn: async () => {
      try {
        const stories = await storiesAPI.getAll(params);
        return Array.isArray(stories) ? stories : [];
      } catch (error) {
        console.error('Error fetching stories:', error);
        return [];
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useUserStories(userId: number) {
  return useQuery({
    queryKey: ['stories', 'user', userId],
    queryFn: async () => {
      try {
        const stories = await storiesAPI.getUserStories(userId);
        return Array.isArray(stories) ? stories : [];
      } catch (error) {
        console.error('Error fetching user stories:', error);
        return [];
      }
    },
    enabled: !!userId,
  });
}

export function useMyStories() {
  return useQuery({
    queryKey: ['stories', 'my-stories'],
    queryFn: async () => {
      try {
        const stories = await storiesAPI.getMyStories();
        return Array.isArray(stories) ? stories : [];
      } catch (error) {
        console.error('Error fetching my stories:', error);
        return [];
      }
    },
  });
}

export function useStory(id: number) {
  return useQuery({
    queryKey: ['stories', id],
    queryFn: async () => {
      try {
        const story = await storiesAPI.getById(id);
        return story ?? null;
      } catch (error) {
        console.error('Error fetching story:', error);
        return null;
      }
    },
    enabled: !!id,
  });
}

export function useStoryViewers(id: number, params?: any) {
  return useQuery({
    queryKey: ['stories', id, 'viewers', params],
    queryFn: async () => {
      try {
        const viewers = await storiesAPI.getViewers(id, params);
        return Array.isArray(viewers) ? viewers : [];
      } catch (error) {
        console.error('Error fetching story viewers:', error);
        return [];
      }
    },
    enabled: !!id,
  });
}

export function useArchivedStories(params?: any) {
  return useQuery({
    queryKey: ['stories', 'archived', params],
    queryFn: async () => {
      try {
        const stories = await storiesAPI.getArchived(params);
        return Array.isArray(stories) ? stories : [];
      } catch (error) {
        console.error('Error fetching archived stories:', error);
        return [];
      }
    },
  });
}

// Stories Mutations
export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStoryDto) => storiesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast.success('Story posted successfully');
    },
    onError: () => {
      toast.error('Failed to post story');
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => storiesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast.success('Story deleted');
    },
    onError: () => {
      toast.error('Failed to delete story');
    },
  });
}

export function useMarkStoryAsViewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => storiesAPI.markAsViewed(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['stories', id] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

export function useArchiveStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => storiesAPI.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast.success('Story archived');
    },
    onError: () => {
      toast.error('Failed to archive story');
    },
  });
}

// Lessons
export function useLesson(lessonId: number) {
  return useQuery({
    queryKey: ['lessons', lessonId],
    queryFn: async () => {
      return await apiClient.get<any>(`/lms/lessons/${lessonId}`);
    },
    enabled: !!lessonId,
  });
}

export function useLessonAccess(lessonId: number) {
  return useQuery({
    queryKey: ['lessons', lessonId, 'access'],
    queryFn: async () => {
      return await apiClient.get<any>(`/lms/lessons/${lessonId}/access-check`);
    },
    enabled: !!lessonId,
  });
}

// Enrollment with type info
export function useEnrollmentWithType(courseId: number) {
  return useQuery({
    queryKey: ['enrollments', courseId, 'with-type'],
    queryFn: async () => {
      try {
        // API client already returns response.data directly
        const enrollment = await apiClient.get<any>(`/lms/enrollments/course/${courseId}`);
        return enrollment ?? null;
      } catch (error) {
        // Return null if not enrolled (404) or other errors
        return null;
      }
    },
    enabled: !!courseId,
  });
}

// Ads hooks
export function useAds(params?: any) {
  return useQuery({
    queryKey: ['ads', params],
    queryFn: () => apiClient.get('/ads', { params }),
  });
}

export function useAdStatistics() {
  return useQuery({
    queryKey: ['ads', 'statistics'],
    queryFn: () => apiClient.get('/ads/statistics'),
  });
}

export function usePauseAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post(`/ads/${id}/pause`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });
}

export function useResumeAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post(`/ads/${id}/resume`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/ads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });
}

export function useAdAnalytics(id: number) {
  return useQuery({
    queryKey: ['ads', id, 'analytics'],
    queryFn: () => apiClient.get(`/ads/${id}/analytics`),
    enabled: !!id,
  });
}

// Admin ads hooks
export function useAdminAds(params?: any) {
  return useQuery({
    queryKey: ['admin', 'ads', params],
    queryFn: () => apiClient.get('/admin/ads', { params }),
  });
}

export function usePendingAds(params?: any) {
  return useQuery({
    queryKey: ['admin', 'ads', 'pending', params],
    queryFn: () => apiClient.get('/admin/ads/pending', { params }),
  });
}

export function useAdminAdStatistics() {
  return useQuery({
    queryKey: ['admin', 'ads', 'statistics'],
    queryFn: () => apiClient.get('/admin/ads/statistics'),
  });
}

export function useApproveAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post(`/admin/ads/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
    },
  });
}

export function useRejectAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => 
      apiClient.post(`/admin/ads/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
    },
  });
}

// Groups hooks
export function useGroup(id: number) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => groupsAPI.getById(id).then(res => (res as any).data || res),
    enabled: !!id,
  });
}

export function useGroupMembers(id: number, params?: any) {
  return useQuery({
    queryKey: ['groups', id, 'members', params],
    queryFn: () => groupsAPI.getMembers(id, params).then(res => (res as any).data || res),
    enabled: !!id,
  });
}

// Profile Management
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/users/profile'),
  });
}

export function useUserProfile(userId: number) {
  return useQuery({
    queryKey: ['users', userId, 'profile'],
    queryFn: () => apiClient.get(`/users/${userId}/profile`),
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.patch('/users/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      // Use unified mediaAPI for upload
      const uploadResponse = await mediaAPI.upload(file, 'avatars');
      
      // Update user profile with the uploaded avatar URL
      return apiClient.patch('/users/profile', { avatarUrl: uploadResponse.url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Activity Feed
export function useActivityFeed(params?: any) {
  return useQuery({
    queryKey: ['activity-feed', params],
    queryFn: () => apiClient.get('/users/activity-feed', { params }),
  });
}

export function useUserActivity(userId: number, params?: any) {
  return useQuery({
    queryKey: ['users', userId, 'activity', params],
    queryFn: () => apiClient.get(`/users/${userId}/activity`, { params }),
    enabled: !!userId,
  });
}

// Recommendations
export function useRecommendations(type?: 'courses' | 'users' | 'groups' | 'events') {
  return useQuery({
    queryKey: ['recommendations', type],
    queryFn: () => apiClient.get('/recommendations', { params: { type } }),
  });
}

export function useCourseRecommendations() {
  return useQuery({
    queryKey: ['recommendations', 'courses'],
    queryFn: () => apiClient.get('/recommendations/courses'),
  });
}

export function useConnectionRecommendations() {
  return useQuery({
    queryKey: ['recommendations', 'connections'],
    queryFn: () => apiClient.get('/recommendations/connections'),
  });
}

export function useSearchCourses(query: string, params?: any) {
  return useQuery({
    queryKey: ['search', 'courses', query, params],
    queryFn: () => apiClient.get('/search/courses', { params: { query, ...params } }),
    enabled: query.length > 2,
  });
}

export function useSearchUsers(query: string, params?: any) {
  return useQuery({
    queryKey: ['search', 'users', query, params],
    queryFn: () => apiClient.get('/search/users', { params: { query, ...params } }),
    enabled: query.length > 2,
  });
}

export function useSearchGroups(query: string, params?: any) {
  return useQuery({
    queryKey: ['search', 'groups', query, params],
    queryFn: () => apiClient.get('/search/groups', { params: { query, ...params } }),
    enabled: query.length > 2,
  });
}

// Bulk Bookmark Actions
export function useBulkBookmarkActions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ action, itemIds }: { action: 'add' | 'remove'; itemIds: number[] }) =>
      apiClient.post('/favorites/bulk', { action, itemIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Connections/Following
export function useConnections(params?: any) {
  return useQuery({
    queryKey: ['connections', params],
    queryFn: () => apiClient.get('/users/connections', { params }),
  });
}

export function useFollowing() {
  return useQuery({
    queryKey: ['following'],
    queryFn: () => apiClient.get('/users/following'),
  });
}

export function useFollowers() {
  return useQuery({
    queryKey: ['followers'],
    queryFn: () => apiClient.get('/users/followers'),
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => apiClient.post(`/users/${userId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => apiClient.post(`/users/${userId}/unfollow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

// Reactions (Likes)
export function useReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entityType, entityId }: { entityType: string; entityId: number }) =>
      apiClient.post('/reactions', { entityType, entityId }),
    onSuccess: (_, { entityType }) => {
      // Invalidate based on entity type
      if (entityType === 'post') {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      } else if (entityType === 'comment') {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
    },
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entityType, entityId }: { entityType: string; entityId: number }) =>
      apiClient.delete('/reactions', { data: { entityType, entityId } }),
    onSuccess: (_, { entityType }) => {
      if (entityType === 'post') {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      } else if (entityType === 'comment') {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
    },
  });
}

// Bookmarks
export function useBookmarks(params?: any) {
  const { data: session, status } = useSession();
  return useQuery({
    queryKey: ['bookmarks', params],
    queryFn: () => apiClient.get('/favorites/my-favorites', { params }),
    enabled: status !== 'loading' && !!session?.accessToken,
  });
}

// Messages/Chat (if not already covered by socket)
export function useChatRooms() {
  const { data: session, status } = useSession();
  return useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: () => chatAPI.getRooms(),
    enabled: status !== 'loading' && !!session?.accessToken,
  });
}

export function useChatRoom(roomId: string) {
  const { data: session, status } = useSession();
  return useQuery({
    queryKey: ['chat', 'rooms', roomId],
    queryFn: () => chatAPI.getRoom(roomId),
    enabled: !!roomId && status !== 'loading' && !!session?.accessToken,
  });
}

// Settings & Preferences
export function useUserSettings() {
  return useQuery({
    queryKey: ['user', 'settings'],
    queryFn: () => apiClient.get('/users/settings'),
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: any) => apiClient.patch('/users/settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'settings'] });
    },
  });
}

// Privacy Settings
export function usePrivacySettings() {
  return useQuery({
    queryKey: ['user', 'privacy'],
    queryFn: () => apiClient.get('/users/privacy'),
  });
}

export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: any) => apiClient.patch('/users/privacy', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'privacy'] });
    },
  });
}

// ============================================================================
// SOCIAL MEDIA - POSTS HOOKS
// ============================================================================

/**
 * Get a single post by ID
 */
export function usePost(id: number) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => postsAPI.getById(id).then(res => (res as any).data || res),
    enabled: !!id,
  });
}

/**
 * Update an existing post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      postsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

/**
 * Delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      postsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

/**
 * Toggle like on a post
 */
export function useTogglePostLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => 
      postsAPI.toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

/**
 * Hide a post (moderation)
 */
export function useHidePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => 
      postsAPI.hide(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

/**
 * Unhide a post (moderation)
 */
export function useUnhidePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => 
      postsAPI.unhide(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// ============================================================================
// SOCIAL MEDIA - GROUPS HOOKS
// ============================================================================

/**
 * Join a group
 */
export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => 
      groupsAPI.join(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
    },
  });
}

/**
 * Leave a group
 */
export function useLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => 
      groupsAPI.leave(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
    },
  });
}

/**
 * Create a new group
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => 
      groupsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

/**
 * Update an existing group
 */
export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      groupsAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
    },
  });
}

/**
 * Delete a group
 */
export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      groupsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

/**
 * Add member to group
 */
export function useAddGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) => 
      groupsAPI.addMember(groupId, userId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'members'] });
    },
  });
}

/**
 * Approve a group (admin)
 */
export function useApproveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => 
      groupsAPI.approve(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

/**
 * Reject a group (admin)
 */
export function useRejectGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => 
      groupsAPI.reject(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

/**
 * Feature a group
 */
export function useFeatureGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => 
      groupsAPI.feature(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

/**
 * Unfeature a group
 */
export function useUnfeatureGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => 
      groupsAPI.unfeature(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

// ============================================================================
// SOCIAL MEDIA - PAGES HOOKS
// ============================================================================

/**
 * Get all pages with pagination and filtering
 */
export function usePages(params?: any) {
  return useQuery({
    queryKey: ['pages', params],
    queryFn: () => pagesAPI.getAll(params).then(res => (res as any).data || res),
  });
}

/**
 * Get a single page by ID
 */
export function usePage(id: number) {
  return useQuery({
    queryKey: ['pages', id],
    queryFn: () => pagesAPI.getById(id).then(res => (res as any).data || res),
    enabled: !!id,
  });
}

/**
 * Create a new page
 */
export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => 
      pagesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

/**
 * Update an existing page
 */
export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      pagesAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['pages', id] });
    },
  });
}

/**
 * Get a single page by ID (alias for usePage)
 */
export function usePageById(id: number) {
  return usePage(id);
}

/**
 * Get posts for a specific page
 */
export function usePagePosts(pageId: number, params?: any) {
  return useQuery({
    queryKey: ['pages', pageId, 'posts', params],
    queryFn: () => apiClient.get(`/social/pages/${pageId}/posts`, { params }),
    enabled: !!pageId,
  });
}

/**
 * Get current user's posts
 */
export function useMyPosts(params?: any) {
  return useQuery({
    queryKey: ['posts', 'my-posts', params],
    queryFn: async () => {
      try {
        const posts = await apiClient.get<any>('/social/posts/my-posts', { params });
        return Array.isArray(posts) ? posts : (posts as any)?.data || [];
      } catch (error) {
        console.error('Error fetching my posts:', error);
        return [];
      }
    },
  });
}

/**
 * Get current user's pages
 */
export function useMyPages(params?: any) {
  return useQuery({
    queryKey: ['pages', 'my-pages', params],
    queryFn: async () => {
      try {
        const pages = await apiClient.get<any>('/social/pages/my-pages', { params });
        return Array.isArray(pages) ? pages : (pages as any)?.data || [];
      } catch (error) {
        console.error('Error fetching my pages:', error);
        return [];
      }
    },
  });
}

/**
 * Get page analytics
 */
export function usePageAnalytics(pageId: number) {
  return useQuery({
    queryKey: ['pages', pageId, 'analytics'],
    queryFn: async () => {
      try {
        const analytics = await apiClient.get(`/social/pages/${pageId}/analytics`);
        return analytics ?? null;
      } catch (error) {
        console.error('Error fetching page analytics:', error);
        return null;
      }
    },
    enabled: !!pageId,
  });
}

/**
 * Get page followers
 */
export function usePageFollowers(pageId: number, params?: any) {
  return useQuery({
    queryKey: ['pages', pageId, 'followers', params],
    queryFn: async () => {
      try {
        const followers = await apiClient.get<any>(`/social/pages/${pageId}/followers`, { params });
        return Array.isArray(followers) ? followers : (followers as any)?.data || [];
      } catch (error) {
        console.error('Error fetching page followers:', error);
        return [];
      }
    },
    enabled: !!pageId,
  });
}

/**
 * Delete a page
 */
export function useDeletePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      pagesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

/**
 * Verify/unverify a page (admin)
 */
export function useVerifyPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isVerified }: { id: number; isVerified: boolean }) => 
      pagesAPI.verify(id, { isVerified }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['pages', id] });
    },
  });
}

/**
 * Feature a page
 */
export function useFeaturePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: number) => 
      pagesAPI.feature(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

/**
 * Unfeature a page
 */
export function useUnfeaturePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: number) => 
      pagesAPI.unfeature(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

/**
 * Follow a page
 */
export function useFollowPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: number) => 
      apiClient.post(`/social/pages/${pageId}/follow`),
    onSuccess: (_, pageId) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['pages', pageId] });
    },
  });
}

/**
 * Unfollow a page
 */
export function useUnfollowPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: number) => 
      apiClient.delete(`/social/pages/${pageId}/follow`),
    onSuccess: (_, pageId) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['pages', pageId] });
    },
  });
}

/**
 * Toggle like on a page
 */
export function useTogglePageLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: number) => 
      apiClient.post(`/social/pages/${pageId}/like`),
    onSuccess: (_, pageId) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['pages', pageId] });
    },
  });
}

// ============================================================================
// FRIENDS HOOKS
// ============================================================================

/**
 * Send a friend request
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendId: number) => 
      apiClient.post('/friends/request', { friendId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

/**
 * Accept a friend request
 */
export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => 
      apiClient.post(`/friends/accept/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });
}

/**
 * Get friend requests
 */
export function useFriendRequests() {
  return useQuery({
    queryKey: ['friend-requests'],
    queryFn: () => apiClient.get('/friends/requests'),
  });
}

/**
 * Get friends list
 */
export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: () => apiClient.get('/friends'),
  });
}

/**
 * Remove a friend
 */
export function useRemoveFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendshipId: number) => 
      apiClient.delete(`/friends/${friendshipId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}
