/**
 * RTL/LTR Utility Functions and Class Helpers
 * Use these utilities to ensure proper bidirectional support
 */

import { cn } from './utils';

/**
 * Check if current direction is RTL
 * @param locale - Current locale string (e.g., 'ar', 'en')
 */
export function isRTL(locale?: string): boolean {
  if (typeof window === 'undefined') return false;
  const dir = document.documentElement.getAttribute('dir');
  if (dir) return dir === 'rtl';
  
  // Fallback to locale check
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return locale ? rtlLocales.includes(locale.toLowerCase()) : false;
}

/**
 * Get directional class names based on RTL/LTR
 * @example
 * // In LTR: "ml-4"
 * // In RTL: "mr-4"  
 * dirClass('ml-4', 'mr-4')
 */
export function dirClass(ltrClass: string, rtlClass: string, locale?: string): string {
  return isRTL(locale) ? rtlClass : ltrClass;
}

/**
 * Helper to get margin-start class (ms-*)
 * Already supported by Tailwind v4, but included for clarity
 */
export const marginStart = (value: string) => `ms-${value}`;
export const marginEnd = (value: string) => `me-${value}`;
export const paddingStart = (value: string) => `ps-${value}`;
export const paddingEnd = (value: string) => `pe-${value}`;

/**
 * Class helper for RTL-aware positioning
 */
export function rtlAwareClass(className: string): string {
  // This is mainly for documentation - Tailwind v4 handles this natively
  // with logical properties (ms-, me-, start-, end-, etc.)
  return className;
}

/**
 * Get text alignment class based on direction
 */
export function textAlign(align: 'start' | 'end' | 'center'): string {
  return `text-${align}`;
}

/**
 * Icon classes that should flip in RTL
 * Add 'rtl-flip' class to icons that indicate direction
 */
export function iconFlipClass(shouldFlip: boolean = false): string {
  return shouldFlip ? 'rtl-flip' : '';
}

/**
 * Directional icons that need flipping
 */
export const DIRECTIONAL_ICONS = [
  'ChevronLeft',
  'ChevronRight', 
  'ArrowLeft',
  'ArrowRight',
  'ChevronDoubleLeft',
  'ChevronDoubleRight',
] as const;

/**
 * Check if icon name requires RTL flipping
 */
export function shouldFlipIcon(iconName: string): boolean {
  return DIRECTIONAL_ICONS.some(name => iconName.includes(name));
}