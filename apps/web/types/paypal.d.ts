/**
 * Type declarations for PayPal SDK v6 web components
 * 
 * PayPal SDK v6 uses custom web components for UI elements:
 * - <paypal-button> - Standard PayPal payment button
 * - <paypal-pay-later-button> - Pay Later button (Buy Now Pay Later)
 * - <paypal-credit-button> - PayPal Credit button
 * 
 * These components are rendered by the PayPal SDK and styled dynamically.
 */

declare namespace JSX {
  interface IntrinsicElements {
    /**
     * PayPal payment button component
     * Used for standard PayPal checkout
     */
    'paypal-button': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        hidden?: boolean;
        type?: 'pay' | 'subscribe';
        style?: React.CSSProperties;
      },
      HTMLElement
    >;
    
    /**
     * PayPal Pay Later button component
     * Used for Buy Now Pay Later payment option
     * Requires productCode and countryCode attributes
     */
    'paypal-pay-later-button': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        hidden?: boolean;
        productCode?: string;
        countryCode?: string;
        style?: React.CSSProperties;
      },
      HTMLElement
    >;
    
    /**
     * PayPal Credit button component
     * Used for PayPal Credit payment option
     * Requires countryCode attribute
     */
    'paypal-credit-button': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        hidden?: boolean;
        countryCode?: string;
        style?: React.CSSProperties;
      },
      HTMLElement
    >;
  }
}
