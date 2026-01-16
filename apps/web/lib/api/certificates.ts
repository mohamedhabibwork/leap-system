import { apiClient } from './client';

export interface Certificate {
  id: string;
  enrollmentId: number;
  courseId: number;
  userId: number;
  filePath: string;
  downloadUrl: string;
  issuedAt: Date;
  verified: boolean;
}

export interface CertificateVerification {
  valid: boolean;
  enrollment?: any;
  user?: any;
  course?: any;
}

/**
 * Certificates API Service
 */
export const certificatesAPI = {
  /**
   * Generate certificate for a course
   */
  generate: (courseId: number) =>
    apiClient.post<{
      filePath: string;
      downloadUrl: string;
      certificateId: string;
    }>(`/lms/certificates/generate/${courseId}`),

  /**
   * Verify certificate authenticity
   */
  verify: (certificateId: string) =>
    apiClient.get<CertificateVerification>(
      `/lms/certificates/${certificateId}/verify`,
    ),

  /**
   * Get certificate download URL
   */
  getDownloadUrl: (certificateId: string) =>
    apiClient.get<{ url: string | null }>(
      `/lms/certificates/${certificateId}/download-url`,
    ),

  /**
   * Download certificate PDF
   */
  download: (certificateId: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return `${API_URL}/api/v1/lms/certificates/${certificateId}/download`;
  },

  /**
   * Send certificate via email
   */
  sendEmail: (certificateId: string) =>
    apiClient.post(`/lms/certificates/${certificateId}/send-email`),
};
