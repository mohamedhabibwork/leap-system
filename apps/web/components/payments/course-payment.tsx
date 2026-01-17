'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import apiClient from '@/lib/api/client';
import { MockPaymentButton } from './mock-payment-button';

interface CoursePaymentProps {
  courseId: number;
  amount: string;
  onSuccess?: () => void;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function CoursePayment({ courseId, amount, onSuccess, size = 'default', className }: CoursePaymentProps) {
  const queryClient = useQueryClient();
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleApprove = async (data: { orderId: string }) => {
    // Store order ID for enrollment
    setOrderId(data.orderId);
  };

  const handleSuccess = async () => {
    try {
      // Validate courseId before proceeding
      if (!courseId || isNaN(courseId)) {
        console.error('Invalid courseId:', courseId);
        throw new Error('Invalid course ID');
      }

      // Enroll user in course after successful payment
      // Backend will create enrollment and payment record
      await apiClient.post('/lms/enrollments', {
        course_id: courseId,
        enrollment_type: 'purchase',
        amount: amount,
        orderId: orderId || undefined,
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      
      onSuccess?.();
    } catch (error) {
      console.error('Enrollment error:', error);
      throw error; // Re-throw to let MockPaymentButton handle error display
    }
  };

  return (
    <MockPaymentButton
      amount={amount}
      currency="USD"
      onApprove={handleApprove}
      onSuccess={handleSuccess}
      buttonLabel="Buy Now"
      size={size}
      className={className}
    />
  );
}
