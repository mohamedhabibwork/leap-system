'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, type Locale } from '@/i18n';

/**
 * Locale Switcher Component
 * Allows users to switch between English and Arabic languages
 * Uses next-intl navigation for locale-aware routing
 */
export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations('common.locale');
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentLocale = (params.locale as Locale) || 'en';

  const switchLocale = (newLocale: Locale) => {
    // Use next-intl's router.replace with locale option
    // This properly handles the locale change while preserving the current path
    router.replace(pathname, { locale: newLocale });
  };

  // Render placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label={t('switch')} suppressHydrationWarning>
        <Globe className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">{t('switch')}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('switch')}>
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('switch')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={currentLocale === locale ? 'bg-accent' : ''}
          >
            <span className="mr-2 text-lg">
              {locale === 'en' ? '🇬🇧' : '🇸🇦'}
            </span>
            <span>{t(locale)}</span>
            {currentLocale === locale && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
