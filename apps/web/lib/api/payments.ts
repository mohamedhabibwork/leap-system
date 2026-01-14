/**
 * Payments API
 * Handles payment-related API calls
 */

import { env } from '../config/env';

export interface Payment {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  transactionId: string;
  invoiceNumber: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceInfo {
  invoiceNumber: string;
  paymentId: number;
  amount: number;
  currency: string;
  statusId: number;
  paymentDate: string;
  downloadUrl: string;
}

class PaymentsAPI {
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
   * Get current user's payment history
   */
  async getMyPayments(): Promise<Payment[]> {
    return this.request<Payment[]>('/payments/my-payments');
  }

  /**
   * Get payment by ID
   */
  async getPayment(id: number): Promise<Payment> {
    return this.request<Payment>(`/payments/${id}`);
  }

  /**
   * Get invoice information
   */
  async getInvoice(paymentId: number): Promise<InvoiceInfo> {
    return this.request<InvoiceInfo>(`/payments/${paymentId}/invoice`);
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(paymentId: number): Promise<Blob> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') || sessionStorage.getItem('token')
      : null;

    const response = await fetch(
      `${this.baseUrl}/api/v1/payments/${paymentId}/invoice/download`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to download invoice: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Download invoice PDF and trigger browser download
   */
  async downloadInvoiceFile(paymentId: number, filename?: string): Promise<void> {
    const blob = await this.downloadInvoice(paymentId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `invoice-${paymentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export default new PaymentsAPI();
