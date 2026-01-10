'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useScrollProgress, useScrollDirection } from '@/lib/hooks/use-scroll-animation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SimpleThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';

const navigationLinks = [
  { labelKey: 'features', href: '#features' },
  { labelKey: 'howItWorks', href: '#how-it-works' },
  { labelKey: 'pricing', href: '#pricing' },
  { labelKey: 'testimonials', href: '#testimonials' },
];

export function LandingHeader() {
  const t = useTranslations('landing.header');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollProgress = useScrollProgress();
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setMobileMenuOpen(false);
      }
    }
  };

  // Hide header when scrolling down, show when scrolling up
  const shouldHide = scrollDirection === 'down' && isScrolled && scrollProgress < 95;

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <header
        className={`fixed top-1 left-0 right-0 z-40 transition-all duration-500 ${
          shouldHide ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div
          className={`mx-4 lg:mx-8 rounded-2xl transition-all duration-300 ${
            isScrolled
              ? 'bg-background/80 backdrop-blur-xl border border-border shadow-lg'
              : 'bg-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105"
              >
                <span className="text-2xl">🎓</span>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LEAP PM
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navigationLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-muted/50"
                  >
                    {t(`nav.${link.labelKey}` as any)}
                  </a>
                ))}
              </nav>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3">
                <SimpleThemeToggle />
                <LocaleSwitcher />
                
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    {t('login')}
                  </Button>
                </Link>
                
                <Link href="/register">
                  <Button
                    size="sm"
                    className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    {t('signUp')}
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden items-center gap-2">
                <SimpleThemeToggle />
                <LocaleSwitcher />
                
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      {mobileMenuOpen ? (
                        <X className="h-5 w-5" />
                      ) : (
                        <Menu className="h-5 w-5" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <div className="flex flex-col gap-6 mt-8">
                      {/* Mobile Navigation Links */}
                      <nav className="flex flex-col gap-2">
                        {navigationLinks.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            onClick={(e) => handleSmoothScroll(e, link.href)}
                            className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-muted/50"
                          >
                            {t(`nav.${link.labelKey}` as any)}
                          </a>
                        ))}
                      </nav>

                      {/* Mobile Actions */}
                      <div className="flex flex-col gap-3 pt-6 border-t">
                        <Link href="/login" className="w-full">
                          <Button variant="outline" className="w-full font-medium">
                            {t('login')}
                          </Button>
                        </Link>
                        <Link href="/register" className="w-full">
                          <Button
                            className="w-full font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          >
                            {t('signUp')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
