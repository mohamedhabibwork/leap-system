import { locales, type Locale } from '@/i18n';

/**
 * Get localized path by prepending the locale
 * @param path - The path without locale
 * @param locale - The locale to prepend
 * @returns The localized path
 */
export function getLocalizedPath(path: string, locale: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If path already starts with a locale, replace it
  const localePattern = new RegExp(`^/(${locales.join('|')})`);
  if (localePattern.test(cleanPath)) {
    return cleanPath.replace(localePattern, `/${locale}`);
  }
  
  // Otherwise, prepend the locale
  return `/${locale}${cleanPath}`;
}

/**
 * Get translated field from an object based on locale
 * Assumes fields are named like titleEn, titleAr
 * @param obj - The object containing localized fields
 * @param field - The base field name (e.g., 'title')
 * @param locale - The locale to use
 * @returns The translated value
 */
export function getLocalizedField<T extends Record<string, any>>(
  obj: T,
  field: string,
  locale: string
): string {
  const localizedField = locale === 'ar' 
    ? `${field}Ar` 
    : `${field}En`;
  
  return obj[localizedField] || obj[field] || '';
}

/**
 * Format date with locale-aware formatting
 * @param date - The date to format
 * @param locale - The locale to use
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatLocalizedDate(
  date: Date | string | number,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
    
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format number with locale-aware formatting
 * @param number - The number to format
 * @param locale - The locale to use
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export function formatLocalizedNumber(
  number: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(number);
}

/**
 * Format currency with locale-aware formatting
 * @param amount - The amount to format
 * @param locale - The locale to use
 * @param currency - The currency code (e.g., 'USD', 'EUR')
 * @returns Formatted currency string
 */
export function formatLocalizedCurrency(
  amount: number,
  locale: string,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Get text direction for a locale
 * @param locale - The locale
 * @returns 'rtl' for Arabic, 'ltr' for others
 */
export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Check if a locale is RTL
 * @param locale - The locale to check
 * @returns true if RTL, false otherwise
 */
export function isRTL(locale: string): boolean {
  return locale === 'ar';
}

/**
 * Get locale name in its native language
 * @param locale - The locale
 * @returns The native name
 */
export function getLocaleNativeName(locale: string): string {
  const names: Record<string, string> = {
    en: 'English',
    ar: 'العربية',
  };
  
  return names[locale] || locale;
}

/**
 * Parse locale from pathname
 * @param pathname - The pathname to parse
 * @returns The locale or null
 */
export function parseLocaleFromPathname(pathname: string): Locale | null {
  const match = pathname.match(/^\/(en|ar)/);
  return match ? (match[1] as Locale) : null;
}

/**
 * Remove locale from pathname
 * @param pathname - The pathname with locale
 * @returns The pathname without locale
 */
export function removeLocaleFromPathname(pathname: string): string {
  return pathname.replace(/^\/(en|ar)/, '') || '/';
}

/**
 * Validate if a string is a supported locale
 * @param locale - The string to validate
 * @returns true if valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
