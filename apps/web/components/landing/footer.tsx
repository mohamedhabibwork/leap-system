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
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('sections.product.title')}</h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.nameKey}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {t(item.nameKey as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('sections.company.title')}</h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.nameKey}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {t(item.nameKey as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('sections.resources.title')}</h3>
            <ul className="space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.nameKey}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {t(item.nameKey as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('sections.legal.title')}</h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.nameKey}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {t(item.nameKey as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-800 pt-12 pb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-white font-semibold mb-2">{t('newsletter.title')}</h3>
            <p className="text-sm mb-4">{t('newsletter.description')}</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder={t('newsletter.placeholder')}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                {t('newsletter.button')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-white">LEAP PM</div>
            <p className="text-sm">
              {t('copyright', { year: new Date().getFullYear() })}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  aria-label={social.name}
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
