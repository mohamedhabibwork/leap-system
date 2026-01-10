import { routing } from './routing';

// Re-export routing configuration
export { routing };

// Re-export navigation helpers from next-intl
export { Link, redirect, usePathname, useRouter, getPathname } from './navigation';

// Export locales array and Locale type
export const locales = routing.locales;
export type Locale = (typeof routing.locales)[number];
