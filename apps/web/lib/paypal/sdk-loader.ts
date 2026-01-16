/**
 * PayPal SDK v6 Script Loader
 * Loads the PayPal JavaScript SDK v6 script dynamically
 * 
 * PayPal SDK v6 uses a modular approach with:
 * - Client tokens (instead of client IDs in URLs)
 * - createInstance() for initialization
 * - Web components for UI elements
 * - Payment sessions for transaction handling
 */

declare global {
  interface Window {
    paypal?: {
      createInstance: (config: {
        clientToken: string;
        components?: string[];
        pageType?: string;
        locale?: string;
        currency?: string;
      }) => Promise<PayPalSDKInstance>;
    };
  }
}

export interface PayPalSDKInstance {
  /**
   * Find eligible payment methods for the given options
   */
  findEligibleMethods: (options: {
    currencyCode?: string;
    countryCode?: string;
    amount?: string;
  }) => Promise<{
    isEligible: (method: string) => boolean;
    getDetails: (method: string) => {
      productCode?: string;
      countryCode?: string;
      [key: string]: any;
    } | null;
  }>;
  
  /**
   * Create a PayPal one-time payment session
   */
  createPayPalOneTimePaymentSession: (options: {
    onApprove?: (data: { orderId: string }) => void | Promise<void>;
    onCancel?: () => void;
    onError?: (error: Error) => void;
  }) => PayPalPaymentSession;
  
  /**
   * Create a Pay Later one-time payment session
   */
  createPayLaterOneTimePaymentSession: (options: {
    onApprove?: (data: { orderId: string }) => void | Promise<void>;
    onCancel?: () => void;
    onError?: (error: Error) => void;
  }) => PayPalPaymentSession;
  
  /**
   * Create a PayPal Credit one-time payment session
   */
  createPayPalCreditOneTimePaymentSession: (options: {
    onApprove?: (data: { orderId: string }) => void | Promise<void>;
    onCancel?: () => void;
    onError?: (error: Error) => void;
  }) => PayPalPaymentSession;
}

export interface PayPalPaymentSession {
  /**
   * Start the payment session
   */
  start: (
    options: {
      presentationMode?: 'auto' | 'inline' | 'fullPage';
      [key: string]: any;
    },
    orderPromise: Promise<{ orderId: string }>
  ) => Promise<void>;
  
  /**
   * Check if the session has returned from a redirect
   */
  hasReturned?: () => boolean;
  
  /**
   * Resume a session after redirect
   */
  resume?: () => Promise<void>;
}

const PAYPAL_SDK_URLS = {
  sandbox: 'https://www.sandbox.paypal.com/web-sdk/v6/core',
  live: 'https://www.paypal.com/web-sdk/v6/core',
};

let scriptLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Load PayPal SDK v6 script
 * SDK v6 uses a secure, modular approach with client tokens
 */
export async function loadPayPalSDK(): Promise<void> {
  if (scriptLoaded && window.paypal) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const mode = (process.env.NEXT_PUBLIC_PAYPAL_MODE || 'sandbox') as 'sandbox' | 'live';
    const scriptUrl = PAYPAL_SDK_URLS[mode];
    
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      scriptLoaded = true;
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      scriptLoaded = true;
      loadPromise = null;
      resolve();
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load PayPal SDK v6'));
    };
    
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Initialize PayPal SDK v6 instance with client token
 * 
 * @param clientToken - Browser-safe client token from backend
 * @param options - Additional initialization options
 * @returns PayPal SDK instance
 */
export async function initializePayPalSDK(
  clientToken: string,
  options?: {
    components?: string[];
    pageType?: string;
    locale?: string;
    currency?: string;
  }
): Promise<PayPalSDKInstance> {
  await loadPayPalSDK();

  if (!window.paypal || !window.paypal.createInstance) {
    throw new Error('PayPal SDK v6 not loaded. Make sure the script is loaded correctly.');
  }

  try {
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: options?.components || ['paypal-payments'],
      pageType: options?.pageType || 'checkout',
      locale: options?.locale || 'en-US',
      currency: options?.currency || 'USD',
    });

    return sdkInstance;
  } catch (error) {
    console.error('PayPal SDK v6 initialization error:', error);
    throw new Error(
      `Failed to initialize PayPal SDK v6: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
