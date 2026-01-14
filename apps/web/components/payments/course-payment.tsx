'use client';

import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { PayPalCheckoutV6 } from './paypal-checkout-v6';

interface CoursePaymentProps {
  courseId: number;
  amount: string;
  onSuccess?: () => void;
}

export function CoursePayment({ courseId, amount, onSuccess }: CoursePaymentProps) {
  const queryClient = useQueryClient();

  const handleSuccess = async () => {
    try {
      // Enroll user in course after successful payment
      await apiClient.post('/lms/enrollments', { courseId });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      
      onSuccess?.();
    } catch (error) {
      console.error('Enrollment error:', error);
    }
  };

  return (
    <PayPalCheckoutV6
      amount={amount}
      currency="USD"
      onSuccess={handleSuccess}
      showAllMethods={true}
    />
  );
}
