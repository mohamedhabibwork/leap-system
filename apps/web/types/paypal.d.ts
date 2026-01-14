/**
 * Type declarations for PayPal SDK v6 web components
 */

declare namespace JSX {
  interface IntrinsicElements {
    'paypal-button': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        hidden?: boolean;
        style?: React.CSSProperties;
      },
      HTMLElement
    >;
    'paypal-pay-later-button': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        hidden?: boolean;
        productCode?: string;
        countryCode?: string;
        style?: React.CSSProperties;
      },
      HTMLElement
    >;
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
