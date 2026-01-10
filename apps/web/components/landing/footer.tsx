'use client';

import { Facebook, Linkedin, Youtube, Instagram, Github, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'X', icon: Twitter, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'GitHub', icon: Github, href: 'https://github.com' },
];

export function Footer() {
  const t = useTranslations('landing.footer');

  const navigation = {
    product: [
      { nameKey: 'sections.product.links.features', href: '#features' },
      { nameKey: 'sections.product.links.pricing', href: '#pricing' },
      { nameKey: 'sections.product.links.courses', href: '/hub/courses' },
      { nameKey: 'sections.product.links.instructors', href: '/become-instructor' },
    ],
    company: [
      { nameKey: 'sections.company.links.about', href: '/about' },
      { nameKey: 'sections.company.links.blog', href: '/blog' },
      { nameKey: 'sections.company.links.careers', href: '/careers' },
      { nameKey: 'sections.company.links.contact', href: '/contact' },
    ],
    resources: [
      { nameKey: 'sections.resources.links.documentation', href: '/docs' },
      { nameKey: 'sections.resources.links.api', href: '/api/docs' },
      { nameKey: 'sections.resources.links.helpCenter', href: '/help' },
      { nameKey: 'sections.resources.links.community', href: '/community' },
    ],
    legal: [
      { nameKey: 'sections.legal.links.privacy', href: '/privacy' },
      { nameKey: 'sections.legal.links.terms', href: '/terms' },
      { nameKey: 'sections.legal.links.cookies', href: '/cookies' },
      { nameKey: 'sections.legal.links.accessibility', href: '/accessibility' },
    ],
  };

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Product */}
          <div>
            <h3 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('sections.product.title')}
            </h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.nameKey}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                  >
                    {t(item.nameKey as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('sections.company.title')}
            </h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.nameKey}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                  >
                    {t(item.nameKey as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('sections.resources.title')}
            </h3>
            <ul className="space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.nameKey}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                  >
                    {t(item.nameKey as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('sections.legal.title')}
            </h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.nameKey}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                  >
                    {t(item.nameKey as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-border pt-12 pb-12">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-foreground font-semibold mb-2 text-lg">{t('newsletter.title')}</h3>
            <p className="text-muted-foreground text-sm mb-6">{t('newsletter.description')}</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder={t('newsletter.placeholder')}
                className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-600 text-foreground placeholder-muted-foreground text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-lg transition-colors duration-200 text-sm"
              >
                {t('newsletter.button')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LEAP PM
            </Link>
            <p className="text-xs text-muted-foreground">
              {t('copyright', { year: new Date().getFullYear() })}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  className="p-2 rounded-lg hover:bg-muted transition-colors duration-200 text-muted-foreground hover:text-foreground"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
