import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cairo, Noto_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { seoConfig } from '@/lib/seo/config';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n';

const locales = routing.locales;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: 'swap',
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: 'swap',
});

// Generate metadata dynamically based on locale
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ogLocale = locale === 'ar' ? 'ar_AR' : 'en_US';
  
  return {
    metadataBase: new URL(seoConfig.siteUrl),
    title: {
      default: seoConfig.defaultTitle,
      template: seoConfig.titleTemplate,
    },
    description: seoConfig.siteDescription,
    keywords: seoConfig.defaultKeywords,
    authors: [{ name: seoConfig.siteName }],
    creator: seoConfig.siteName,
    publisher: seoConfig.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: ogLocale,
      url: `${seoConfig.siteUrl}/${locale}`,
      siteName: seoConfig.siteName,
      title: seoConfig.defaultTitle,
      description: seoConfig.siteDescription,
      images: [
        {
          url: seoConfig.defaultImage,
          width: 1200,
          height: 630,
          alt: seoConfig.siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: seoConfig.twitterHandle,
      creator: seoConfig.twitterHandle,
      title: seoConfig.defaultTitle,
      description: seoConfig.siteDescription,
      images: [seoConfig.defaultImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    alternates: {
      canonical: `${seoConfig.siteUrl}/${locale}`,
      languages: {
        'en': `${seoConfig.siteUrl}/en`,
        'ar': `${seoConfig.siteUrl}/ar`,
      },
    },
    ...(isPWAEnabled() && { manifest: '/manifest.json' }),
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4f46e5' },
    { media: '(prefers-color-scheme: dark)', color: '#4f46e5' },
  ],
  userScalable: true,
  viewportFit: 'cover',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

import { Providers } from '../providers';
import { SEODebug } from '@/components/seo/seo-debug';
import { WebVitals } from '@/components/analytics/web-vitals';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';
import { PWAInstallPrompt } from '@/components/pwa/pwa-install-prompt';
import { PWAUpdatePrompt } from '@/components/pwa/pwa-update-prompt';
import { isPWAEnabled } from '@/lib/utils/pwa';

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Set the request locale for server components
  setRequestLocale(locale);

  // Get messages loaded by next-intl via i18n/request.ts
  const messages = await getMessages();

  // Determine text direction based on locale
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  
  // Use Arabic fonts for Arabic locale
  const fontVariables = locale === 'ar' 
    ? `${cairo.variable} ${notoSansArabic.variable} ${geistMono.variable}`
    : `${geistSans.variable} ${geistMono.variable}`;

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body
        className={`${fontVariables} antialiased`}
        style={{
          fontFamily: locale === 'ar' 
            ? 'var(--font-cairo), var(--font-noto-arabic), system-ui, sans-serif'
            : 'var(--font-geist-sans), system-ui, sans-serif'
        }}
      >
        <NextIntlClientProvider messages={messages}>
          {isPWAEnabled() && <ServiceWorkerRegister />}
          <WebVitals />
          <Providers>{children}</Providers>
          {isPWAEnabled() && (
            <>
              <PWAInstallPrompt />
              <PWAUpdatePrompt />
            </>
          )}
          <SEODebug />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
