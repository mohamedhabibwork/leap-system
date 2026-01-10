import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the locale is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load all message files for the locale
  const messages = await import(`../locales/${locale}.json`).then(
    (module) => module.default
  );

  return {
    locale,
    messages,
    timeZone: 'UTC',
    now: new Date(),
  };
});
