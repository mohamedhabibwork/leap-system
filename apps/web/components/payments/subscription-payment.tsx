'use client';

import { PayPalButtons } from '@paypal/react-paypal-js';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SubscriptionPaymentProps {
  planId: string;
  planName: string;
  planPrice: string;
  onSuccess?: () => void;
}

export function SubscriptionPayment({
  planId,
  planName,
  planPrice,
  onSuccess,
}: SubscriptionPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const createSubscription = useMutation({
    mutationFn: () =>
      apiClient.post('/payments/create-subscription', {
        planId,
      }),
    onSuccess: () => {
      toast.success(`Successfully subscribed to ${planName}!`);
      onSuccess?.();
      setIsProcessing(false);
    },
    onError: () => {
      toast.error('Subscription creation failed. Please try again.');
      setIsProcessing(false);
    },
  });

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      await createSubscription.mutateAsync();
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">{planName}</h3>
        <p className="text-2xl font-bold">${planPrice}/month</p>
      </div>

      <Button
        onClick={handleSubscribe}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? 'Processing...' : 'Subscribe Now'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Note: PayPal subscriptions require additional setup with PayPal Billing API.
        This is a placeholder implementation.
      </p>
    </div>
  );
}
