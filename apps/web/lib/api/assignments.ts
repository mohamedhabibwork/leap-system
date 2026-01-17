import { apiClient } from './client';

export interface Assignment {
  id: number;
  uuid: string;
  sectionId: number;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  instructionsEn?: string;
  instructionsAr?: string;
  maxPoints: number;
  dueDate?: Date;
  maxAttempts?: number;
  allowLateSubmission: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Assignments API Service
 */
export const assignmentsAPI = {
  /**
   * Get an assignment by ID
   */
  getById: (id: number) =>
    apiClient.get<Assignment>(`/lms/assignments/${id}`),

  /**
   * Submit an assignment
   */
  submit: (assignmentId: number, data: { content: string; fileUrl?: string }) =>
    apiClient.post(`/lms/assignments/${assignmentId}/submit`, data),

  /**
   * Get my submission for an assignment
   */
  getMySubmission: (assignmentId: number) =>
    apiClient.get(`/lms/assignments/${assignmentId}/my-submission`),
};
