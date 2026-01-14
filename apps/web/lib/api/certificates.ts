/**
 * Certificates API
 * Handles certificate-related API calls
 */

import apiClient from './client';

export interface CertificateInfo {
  message: string;
  downloadUrl: string;
  enrollmentId: number;
}

class CertificatesAPI {
  /**
   * Generate certificate for enrollment
   */
  async generateCertificate(enrollmentId: number): Promise<CertificateInfo> {
    return apiClient.get<CertificateInfo>(`/lms/certificates/${enrollmentId}/generate`);
  }

  /**
   * Download certificate PDF
   */
  async downloadCertificate(enrollmentId: number): Promise<Blob> {
    return apiClient.get<Blob>(`/lms/certificates/${enrollmentId}/download`, {
      responseType: 'blob',
    });
  }

  /**
   * Download certificate PDF and trigger browser download
   */
  async downloadCertificateFile(enrollmentId: number, filename?: string): Promise<void> {
    const blob = await this.downloadCertificate(enrollmentId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `certificate-${enrollmentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export default new CertificatesAPI();
