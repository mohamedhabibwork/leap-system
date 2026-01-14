'use client';

import { PayPalCheckoutV6 } from './paypal-checkout-v6';
import { paymentsAPI } from '@/lib/api/payments';
import { toast } from 'sonner';

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
  const handleApprove = async (data: { orderId: string }) => {
    try {
      // Create subscription after payment approval
      await paymentsAPI.createSubscription(planId);
      toast.success(`Successfully subscribed to ${planName}!`);
      onSuccess?.();
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">{planName}</h3>
        <p className="text-2xl font-bold">${planPrice}/month</p>
      </div>

      <PayPalCheckoutV6
        amount={planPrice}
        currency="USD"
        onApprove={handleApprove}
        showAllMethods={true}
        buttonLabel={`Subscribe to ${planName}`}
      />

      <p className="text-xs text-muted-foreground text-center">
        Subscribe using PayPal, Pay Later, or PayPal Credit
      </p>
    </div>
  );
}
