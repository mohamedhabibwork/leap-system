'use client';

import { useState } from 'react';
import { MockPaymentButton } from './mock-payment-button';
import { toast } from 'sonner';

interface SubscriptionPaymentProps {
  planId: string;
  planName: string;
  planPrice: string;
  onSuccess?: () => void;
}

/**
 * Subscription Payment Component
 * 
 * This component:
 * 1. Creates an order with vault enabled for recurring payments
 * 2. After capture, extracts vault_id (payment method token)
 * 3. Creates subscription with vault_id for future recurring payments
 */
export function SubscriptionPayment({
  planId,
  planName,
  planPrice,
  onSuccess,
}: SubscriptionPaymentProps) {
  const [vaultId, setVaultId] = useState<string | null>(null);

  const handleApprove = async (data: { orderId: string }) => {
    try {
      // Generate mock vault ID for subscriptions (client-side only)
      const mockVaultId = `MOCK_VAULT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setVaultId(mockVaultId);
      console.debug(`Mock Vault ID generated: ${mockVaultId}`);

      // Mock subscription creation - entirely client-side
      // No backend calls to payments/* endpoints
      // In a real implementation, you would call a subscription creation endpoint here
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success(`Successfully subscribed to ${planName}!`);
      onSuccess?.();
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-3">
      <MockPaymentButton
        amount={planPrice}
        currency="USD"
        onApprove={handleApprove}
        buttonLabel={`Subscribe to ${planName}`}
        storeInVault={true} // Enable vault for recurring payments
      />

      <p className="text-xs text-muted-foreground text-center">
        Complete your subscription payment
      </p>
    </div>
  );
}
