import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

/**
 * Root not-found page
 * Redirects to the default locale's not-found page
 * This ensures proper i18n handling for 404 errors
 */
export default function RootNotFound() {
  redirect(`/${routing.defaultLocale}`);
}
