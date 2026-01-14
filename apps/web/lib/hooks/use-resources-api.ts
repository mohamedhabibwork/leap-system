import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type {
  CourseResource,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceDownloadResponse,
} from '@leap-lms/shared-types';

export function useCourseResources(courseId: number, enabled = true) {
  return useQuery<CourseResource[]>({
    queryKey: ['resources', 'course', courseId],
    queryFn: () => apiClient.get<CourseResource[]>(`/lms/resources/course/${courseId}`),
    enabled,
  });
}

export function useSectionResources(sectionId: number, enabled = true) {
  return useQuery<CourseResource[]>({
    queryKey: ['resources', 'section', sectionId],
    queryFn: () => apiClient.get<CourseResource[]>(`/lms/resources/section/${sectionId}`),
    enabled,
  });
}

export function useLessonResources(lessonId: number, enabled = true) {
  return useQuery<CourseResource[]>({
    queryKey: ['resources', 'lesson', lessonId],
    queryFn: () => apiClient.get<CourseResource[]>(`/lms/resources/lesson/${lessonId}`),
    enabled,
  });
}

export function useResource(id: number, enabled = true) {
  return useQuery<CourseResource>({
    queryKey: ['resources', id],
    queryFn: () => apiClient.get<CourseResource>(`/lms/resources/${id}`),
    enabled,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  
  return useMutation<CourseResource, Error, CreateResourceRequest>({
    mutationFn: (data) => apiClient.post<CourseResource>('/lms/resources', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resources', 'course', data.courseId] });
      if (data.sectionId) {
        queryClient.invalidateQueries({ queryKey: ['resources', 'section', data.sectionId] });
      }
      if (data.lessonId) {
        queryClient.invalidateQueries({ queryKey: ['resources', 'lesson', data.lessonId] });
      }
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  
  return useMutation<CourseResource, Error, { id: number; data: UpdateResourceRequest }>({
    mutationFn: ({ id, data }) => apiClient.patch<CourseResource>(`/lms/resources/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resources', data.id] });
      queryClient.invalidateQueries({ queryKey: ['resources', 'course', data.courseId] });
      if (data.sectionId) {
        queryClient.invalidateQueries({ queryKey: ['resources', 'section', data.sectionId] });
      }
      if (data.lessonId) {
        queryClient.invalidateQueries({ queryKey: ['resources', 'lesson', data.lessonId] });
      }
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id: number) => apiClient.delete(`/lms/resources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useTrackResourceDownload() {
  const queryClient = useQueryClient();
  
  return useMutation<ResourceDownloadResponse, Error, number>({
    mutationFn: (id: number) => apiClient.post<ResourceDownloadResponse>(`/lms/resources/${id}/download`, {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resources', data.resourceId] });
    },
  });
}
