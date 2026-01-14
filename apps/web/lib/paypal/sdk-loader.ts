/**
 * PayPal SDK v6 Script Loader
 * Loads the PayPal JavaScript SDK v6 script dynamically
 */

declare global {
  interface Window {
    paypal?: {
      createInstance: (config: {
        clientToken: string;
        components: string[];
        pageType: string;
      }) => Promise<any>;
    };
  }
}

export interface PayPalSDKInstance {
  findEligibleMethods: (options: { currencyCode: string }) => Promise<{
    isEligible: (method: string) => boolean;
    getDetails: (method: string) => any;
  }>;
  createPayPalOneTimePaymentSession: (options: any) => any;
  createPayLaterOneTimePaymentSession: (options: any) => any;
  createPayPalCreditOneTimePaymentSession: (options: any) => any;
}

const PAYPAL_SDK_URLS = {
  sandbox: 'https://www.sandbox.paypal.com/web-sdk/v6/core',
  live: 'https://www.paypal.com/web-sdk/v6/core',
};

let scriptLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Load PayPal SDK v6 script
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
    
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load PayPal SDK'));
    };
    
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Initialize PayPal SDK instance with client token
 */
export async function initializePayPalSDK(
  clientToken: string
): Promise<PayPalSDKInstance> {
  await loadPayPalSDK();

  if (!window.paypal) {
    throw new Error('PayPal SDK not loaded');
  }

  const sdkInstance = await window.paypal.createInstance({
    clientToken,
    components: ['paypal-payments'],
    pageType: 'checkout',
  });

  return sdkInstance;
}
