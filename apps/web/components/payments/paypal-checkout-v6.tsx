'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { usePayPal } from '@/lib/paypal/paypal-provider';
import { paymentsAPI, CartItem } from '@/lib/api/payments';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { PayPalPaymentSession } from '@/lib/paypal/sdk-loader';

export interface PayPalCheckoutV6Props {
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
  /** Show all payment methods (PayPal, Pay Later, PayPal Credit) */
  showAllMethods?: boolean;
  /** Button label */
  buttonLabel?: string;
}

export function PayPalCheckoutV6({
  cart,
  amount,
  currency = 'USD',
  onApprove,
  onCancel,
  onError,
  onSuccess,
  showAllMethods = true,
  buttonLabel = 'Pay with PayPal',
}: PayPalCheckoutV6Props) {
  const t = useTranslations('common.payments');
  const { sdkInstance, isLoading, error: sdkError } = usePayPal();
  const [isProcessing, setIsProcessing] = useState(false);
  const [eligibleMethods, setEligibleMethods] = useState<{
    paypal: boolean;
    paylater: boolean;
    credit: boolean;
  }>({
    paypal: false,
    paylater: false,
    credit: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const paymentSessionsRef = useRef<{
    paypal?: PayPalPaymentSession;
    paylater?: PayPalPaymentSession;
    credit?: PayPalPaymentSession;
  }>({});

  // Check eligibility and set up payment sessions
  useEffect(() => {
    if (!sdkInstance || isLoading) return;

    const setupPaymentMethods = async () => {
      try {
        // Calculate amount for eligibility check
        const amountValue = amount || (cart ? '0' : '0');
        
        // Check eligibility for all payment methods
        const paymentMethods = await sdkInstance.findEligibleMethods({
          currencyCode: currency,
          amount: amountValue,
        });

        const methods = {
          paypal: paymentMethods.isEligible('paypal'),
          paylater: paymentMethods.isEligible('paylater'),
          credit: paymentMethods.isEligible('credit'),
        };

        setEligibleMethods(methods);

        // Set up PayPal button
        if (methods.paypal) {
          await setupPayPalButton(sdkInstance);
        }

        // Set up Pay Later button
        if (methods.paylater && showAllMethods) {
          await setupPayLaterButton(sdkInstance, paymentMethods);
        }

        // Set up PayPal Credit button
        if (methods.credit && showAllMethods) {
          await setupPayPalCreditButton(sdkInstance, paymentMethods);
        }
      } catch (error) {
        console.error('Error setting up payment methods:', error);
        onError?.(error instanceof Error ? error : new Error('Failed to set up payment methods'));
      }
    };

    setupPaymentMethods();
  }, [sdkInstance, isLoading, currency, showAllMethods, onError, amount, cart]);

  const createOrder = useCallback(async () => {
    try {
      const orderData = cart
        ? { cart, currency }
        : { amount, currency };

      const order = await paymentsAPI.createOrder(orderData);
      return { orderId: order.id };
    } catch (error) {
      console.error('Create order error:', error);
      toast.error(t('createOrderFailed', { defaultValue: 'Failed to create order' }));
      throw error;
    }
  }, [cart, currency, amount, t]);

  const handleApprove = useCallback(async (data: { orderId: string }) => {
    try {
      setIsProcessing(true);

      // Call onApprove callback if provided
      if (onApprove) {
        await onApprove(data);
      }

      // Capture the order
      const result = await paymentsAPI.captureOrder({ orderId: data.orderId });

      // Call onSuccess callback if provided
      if (onSuccess) {
        await onSuccess();
      }

      toast.success(t('success'));
    } catch (error) {
      console.error('Payment capture error:', error);
      const err = error instanceof Error ? error : new Error('Payment failed');
      onError?.(err);
      toast.error(t('failed'));
    } finally {
      setIsProcessing(false);
    }
  }, [onApprove, onSuccess, onError, t]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    toast.info(t('cancelled'));
  }, [onCancel, t]);

  const handleError = useCallback((error: Error) => {
    console.error('PayPal error:', error);
    onError?.(error);
    toast.error(t('error'));
  }, [onError, t]);

  const setupPayPalButton = useCallback(async (sdk: typeof sdkInstance) => {
    if (!sdk) return;

    const paymentSessionOptions = {
      async onApprove(data: { orderId: string }) {
        await handleApprove(data);
      },
      onCancel: handleCancel,
      onError: handleError,
    };

    const paypalPaymentSession = sdk.createPayPalOneTimePaymentSession(
      paymentSessionOptions
    );
    
    paymentSessionsRef.current.paypal = paypalPaymentSession;

    const button = containerRef.current?.querySelector('paypal-button') as HTMLElement;
    if (!button) return;

    button.removeAttribute('hidden');

    // Remove existing listeners and add new one
    const newButton = button.cloneNode(true) as HTMLElement;
    button.parentNode?.replaceChild(newButton, button);

    newButton.addEventListener('click', async () => {
      try {
        const order = await createOrder();
        await paypalPaymentSession.start(
          { presentationMode: 'auto' },
          Promise.resolve(order)
        );
      } catch (error) {
        handleError(error instanceof Error ? error : new Error('Failed to start payment'));
      }
    });
  }, [handleApprove, handleCancel, handleError, createOrder, sdkInstance]);

  const setupPayLaterButton = useCallback(async (sdk: typeof sdkInstance, paymentMethods: Awaited<ReturnType<NonNullable<typeof sdkInstance>['findEligibleMethods']>>) => {
    if (!sdk) return;
    
    const paymentMethodDetails = paymentMethods.getDetails('paylater');
    if (!paymentMethodDetails) return;

    const paymentSessionOptions = {
      async onApprove(data: { orderId: string }) {
        await handleApprove(data);
      },
      onCancel: handleCancel,
      onError: handleError,
    };

    const payLaterPaymentSession = sdk.createPayLaterOneTimePaymentSession(
      paymentSessionOptions
    );
    
    paymentSessionsRef.current.paylater = payLaterPaymentSession;

    const button = containerRef.current?.querySelector('paypal-pay-later-button') as HTMLElement;
    if (!button) return;

    const { productCode, countryCode } = paymentMethodDetails;
    (button as any).productCode = productCode;
    (button as any).countryCode = countryCode;
    button.removeAttribute('hidden');

    // Remove existing listeners and add new one
    const newButton = button.cloneNode(true) as HTMLElement;
    button.parentNode?.replaceChild(newButton, button);

    (newButton as any).productCode = productCode;
    (newButton as any).countryCode = countryCode;

    newButton.addEventListener('click', async () => {
      try {
        const order = await createOrder();
        await payLaterPaymentSession.start(
          { presentationMode: 'auto' },
          Promise.resolve(order)
        );
      } catch (error) {
        handleError(error instanceof Error ? error : new Error('Failed to start payment'));
      }
    });
  }, [handleApprove, handleCancel, handleError, createOrder, sdkInstance]);

  const setupPayPalCreditButton = useCallback(async (sdk: typeof sdkInstance, paymentMethods: Awaited<ReturnType<NonNullable<typeof sdkInstance>['findEligibleMethods']>>) => {
    if (!sdk) return;
    
    const paymentMethodDetails = paymentMethods.getDetails('credit');
    if (!paymentMethodDetails) return;

    const paymentSessionOptions = {
      async onApprove(data: { orderId: string }) {
        await handleApprove(data);
      },
      onCancel: handleCancel,
      onError: handleError,
    };

    const paypalCreditPaymentSession = sdk.createPayPalCreditOneTimePaymentSession(
      paymentSessionOptions
    );
    
    paymentSessionsRef.current.credit = paypalCreditPaymentSession;

    const button = containerRef.current?.querySelector('paypal-credit-button') as HTMLElement;
    if (!button) return;

    const { countryCode } = paymentMethodDetails;
    (button as any).countryCode = countryCode;
    button.removeAttribute('hidden');

    // Remove existing listeners and add new one
    const newButton = button.cloneNode(true) as HTMLElement;
    button.parentNode?.replaceChild(newButton, button);

    (newButton as any).countryCode = countryCode;

    newButton.addEventListener('click', async () => {
      try {
        const order = await createOrder();
        await paypalCreditPaymentSession.start(
          { presentationMode: 'auto' },
          Promise.resolve(order)
        );
      } catch (error) {
        handleError(error instanceof Error ? error : new Error('Failed to start payment'));
      }
    });
  }, [handleApprove, handleCancel, handleError, createOrder, sdkInstance]);

  // If PayPal is not available (not configured or error), don't show the component
  // This allows the app to work without PayPal
  if (sdkError && !isLoading) {
    // PayPal not available - return null to hide the component
    // The parent component should handle alternative payment methods
    return null;
  }

  if (isLoading || !sdkInstance) {
    // Only show loading if we're actively trying to load PayPal
    // If it's been too long or there's a persistent error, hide it
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading PayPal...</span>
      </div>
    );
  }

  if (!eligibleMethods.paypal && !eligibleMethods.paylater && !eligibleMethods.credit) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        <p>PayPal payment methods are not available for this transaction.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-3">
      {eligibleMethods.paypal && (
        <div>
          {/* @ts-ignore - PayPal web component */}
          <paypal-button
            hidden
            style={{ width: '100%' }}
          />
        </div>
      )}

      {showAllMethods && eligibleMethods.paylater && (
        <div>
          {/* @ts-ignore - PayPal web component */}
          <paypal-pay-later-button
            hidden
            style={{ width: '100%' }}
          />
        </div>
      )}

      {showAllMethods && eligibleMethods.credit && (
        <div>
          {/* @ts-ignore - PayPal web component */}
          <paypal-credit-button
            hidden
            style={{ width: '100%' }}
          />
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center p-2">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Processing payment...</span>
        </div>
      )}
    </div>
  );
}
