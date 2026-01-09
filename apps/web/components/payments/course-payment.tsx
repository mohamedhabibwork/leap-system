'use client';

import { PayPalButtons } from '@paypal/react-paypal-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';

interface CoursePaymentProps {
  courseId: number;
  amount: string;
  onSuccess?: () => void;
}

export function CoursePayment({ courseId, amount, onSuccess }: CoursePaymentProps) {
  const queryClient = useQueryClient();

  const createOrder = useMutation({
    mutationFn: () =>
      apiClient.post('/payments/create-order', {
        amount,
        currency: 'USD',
      }),
  });

  const captureOrder = useMutation({
    mutationFn: (orderId: string) =>
      apiClient.post('/payments/capture-order', {
        orderId,
      }),
    onSuccess: async () => {
      // Enroll user in course
      await apiClient.post('/lms/enrollments', { courseId });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      
      toast.success('Payment successful! You are now enrolled in the course.');
      onSuccess?.();
    },
    onError: () => {
      toast.error('Payment failed. Please try again.');
    },
  });

  return (
    <PayPalButtons
      createOrder={async () => {
        try {
          const order = await createOrder.mutateAsync();
          return order.id;
        } catch (error) {
          toast.error('Failed to create order');
          throw error;
        }
      }}
      onApprove={async (data) => {
        try {
          await captureOrder.mutateAsync(data.orderID);
        } catch (error) {
          console.error('Payment capture error:', error);
        }
      }}
      onError={(error) => {
        console.error('PayPal error:', error);
        toast.error('Payment error occurred');
      }}
      style={{
        layout: 'vertical',
        label: 'pay',
      }}
    />
  );
}
