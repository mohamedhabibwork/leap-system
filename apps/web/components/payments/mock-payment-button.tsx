'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CartItem {
  id: string;
  quantity: string;
}

export interface MockPaymentButtonProps {
  /** Cart items for the order */
  cart?: CartItem[];
  /** Total amount (fallback if cart not provided) */
  amount?: string;
  /** Currency code */
  currency?: string;
  /** Callback when payment is approved */
  onApprove?: (data: { orderId: string }) => void | Promise<void>;
  /** Callback when payment is cancelled */
  onCancel?: () => void;
  /** Callback when payment error occurs */
  onError?: (error: Error) => void;
  /** Additional callback after successful capture */
  onSuccess?: () => void | Promise<void>;
  /** Button label */
  buttonLabel?: string;
  /** Enable vault for recurring payments/subscriptions */
  storeInVault?: boolean;
  /** Vault ID for future recurring payments using stored payment method */
  vaultId?: string;
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Additional className */
  className?: string;
}

/**
 * Mock Payment Button Component
 * 
 * Simulates payment processing without actual payment gateway integration.
 * Useful for development and testing.
 */
export function MockPaymentButton({
  cart,
  amount,
  currency = 'USD',
  onApprove,
  onCancel,
  onError,
  onSuccess,
  buttonLabel = 'Pay Now',
  storeInVault = false,
  vaultId,
  variant = 'default',
  size = 'default',
  className,
}: MockPaymentButtonProps) {
  const t = useTranslations('payments');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = useCallback(async () => {
    try {
      setIsProcessing(true);

      // Mock payment processing - entirely client-side, no backend calls
      // Generate mock order ID
      const orderId = `MOCK_ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate amount
      const orderAmount = amount || '0.00';
      const orderCurrency = currency || 'USD';

      // Call onApprove callback if provided
      if (onApprove) {
        await onApprove({ orderId });
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock vault ID if needed for subscriptions
      const mockVaultId = storeInVault 
        ? `MOCK_VAULT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        : vaultId || null;

      // Call onSuccess callback if provided
      if (onSuccess) {
        await onSuccess();
      }

      toast.success(t('success', { defaultValue: 'Payment successful!' }));
    } catch (error) {
      console.error('Payment error:', error);
      const err = error instanceof Error ? error : new Error('Payment failed');
      
      // Call onCancel if user cancelled, otherwise onError
      if (err.message.includes('cancelled') || err.message.includes('cancel')) {
        onCancel?.();
        toast.info(t('cancelled', { defaultValue: 'Payment cancelled' }));
      } else {
        onError?.(err);
        toast.error(t('failed', { defaultValue: 'Payment failed' }));
      }
    } finally {
      setIsProcessing(false);
    }
  }, [cart, currency, amount, storeInVault, vaultId, onApprove, onSuccess, onCancel, onError, t]);

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      variant={variant}
      size={size}
      className={className}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {buttonLabel}
        </>
      )}
    </Button>
  );
}
