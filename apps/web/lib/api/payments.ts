/**
 * Payments API
 * Handles payment-related API calls
 */

import apiClient from './client';

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
  /**
   * Get current user's payment history
   */
  async getMyPayments(): Promise<Payment[]> {
    return apiClient.get<Payment[]>('/payments/my-payments');
  }

  /**
   * Get payment by ID
   */
  async getPayment(id: number): Promise<Payment> {
    return apiClient.get<Payment>(`/payments/${id}`);
  }

  /**
   * Get invoice information
   */
  async getInvoice(paymentId: number): Promise<InvoiceInfo> {
    return apiClient.get<InvoiceInfo>(`/payments/${paymentId}/invoice`);
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(paymentId: number): Promise<Blob> {
    return apiClient.get<Blob>(`/payments/${paymentId}/invoice/download`, {
      responseType: 'blob',
    });
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
