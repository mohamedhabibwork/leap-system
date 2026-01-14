import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Search, HelpCircle, BookOpen, MessageCircle } from 'lucide-react';

export default async function SupportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('support');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LEAP PM
            </Link>
            <nav className="flex items-center gap-6 text-sm text-start">
              <Link href="/help" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
                {t('helpCenter')}
              </Link>
              <Link href="/faq" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-4 w-4" />
                {t('faq')}
              </Link>
              <Link href="/docs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <BookOpen className="h-4 w-4" />
                {t('docs')}
              </Link>
              <Link href="/contact" className="text-foreground font-medium hover:text-blue-600 transition-colors">
                {t('contactSupport')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-start">{t('footer.support')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-muted-foreground hover:text-foreground text-start">{t('helpCenter')}</Link></li>
                <li><Link href="/faq" className="text-muted-foreground hover:text-foreground text-start">{t('faq')}</Link></li>
                <li><Link href="/docs" className="text-muted-foreground hover:text-foreground text-start">{t('documentation')}</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground text-start">{t('contactUs')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-start">{t('footer.resources')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-muted-foreground hover:text-foreground text-start">{t('footer.home')}</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground text-start">{t('footer.about')}</Link></li>
                <li><Link href="/careers" className="text-muted-foreground hover:text-foreground text-start">{t('footer.careers')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-start">{t('footer.legal')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground text-start">{t('footer.privacy')}</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground text-start">{t('footer.terms')}</Link></li>
                <li><Link href="/cookies" className="text-muted-foreground hover:text-foreground text-start">{t('footer.cookies')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-start">{t('footer.connect')}</h3>
              <p className="text-sm text-muted-foreground mb-2 text-start">support@leappm.com</p>
              <p className="text-sm text-muted-foreground text-start">{t('footer.available247')}</p>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
