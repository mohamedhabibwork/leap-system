/**
 * Certificates API
 * Handles certificate-related API calls
 */

import { env } from '../config/env';

export interface CertificateInfo {
  message: string;
  downloadUrl: string;
  enrollmentId: number;
}

class CertificatesAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.apiUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') || sessionStorage.getItem('token')
      : null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Generate certificate for enrollment
   */
  async generateCertificate(enrollmentId: number): Promise<CertificateInfo> {
    return this.request<CertificateInfo>(`/lms/certificates/${enrollmentId}/generate`);
  }

  /**
   * Download certificate PDF
   */
  async downloadCertificate(enrollmentId: number): Promise<Blob> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') || sessionStorage.getItem('token')
      : null;

    const response = await fetch(
      `${this.baseUrl}/api/v1/lms/certificates/${enrollmentId}/download`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to download certificate: ${response.statusText}`);
    }

    return response.blob();
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
