'use client';

import { useLocale, useFormatter as useNextIntlFormatter } from 'next-intl';
import { type Locale } from '@/i18n';

/**
 * Get the current locale from the URL
 * Uses next-intl's built-in useLocale hook
 * @returns The current locale
 */
export function useCurrentLocale(): Locale {
  return useLocale() as Locale;
}

/**
 * Hook for locale-aware formatting (dates, numbers, currencies)
 * @returns Formatting functions
 */
export function useLocalizedFormatter() {
  const locale = useCurrentLocale();
  const formatter = useNextIntlFormatter();

  return {
    ...formatter,
    locale,
    formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      return formatter.dateTime(dateObj, options);
    },
    formatNumber: (number: number, options?: Intl.NumberFormatOptions) => {
      return formatter.number(number, options);
    },
    formatCurrency: (amount: number, currency: string = 'USD') => {
      return formatter.number(amount, { style: 'currency', currency });
    },
    formatRelativeTime: (date: Date | string | number) => {
      const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      return formatter.relativeTime(dateObj);
    },
  };
}

/**
 * Hook to get text direction for current locale
 * @returns 'rtl' or 'ltr'
 */
export function useTextDirection(): 'rtl' | 'ltr' {
  const locale = useCurrentLocale();
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Hook to check if current locale is RTL
 * @returns true if RTL
 */
export function useIsRTL(): boolean {
  const locale = useCurrentLocale();
  return locale === 'ar';
}
