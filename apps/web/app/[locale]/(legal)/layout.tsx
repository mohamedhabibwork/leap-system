import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export default async function LegalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'layouts.legal' });

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LEAP Network
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('privacy')}
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('terms')}
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('cookies')}
              </Link>
              <Link href="/accessibility" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('accessibility')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-8">{children}</main>

      {/* Simple Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
