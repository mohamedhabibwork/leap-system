import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Code, Database, Lock, Zap, Globe, Book } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  title: 'Documentation | LEAP PM',
  description: 'Developer documentation and API reference for LEAP PM.',
};

export default async function DocsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('support.docs');

  const sections = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Quick start guides and basic concepts',
      links: [
        { label: 'Introduction', href: '/docs/intro' },
        { label: 'Installation', href: '/docs/installation' },
        { label: 'Configuration', href: '/docs/configuration' },
        { label: 'Authentication', href: '/docs/authentication' },
      ],
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Complete API documentation',
      links: [
        { label: 'REST API Overview', href: '/docs/api/rest' },
        { label: 'GraphQL API', href: '/docs/api/graphql' },
        { label: 'Webhooks', href: '/docs/api/webhooks' },
        { label: 'Rate Limiting', href: '/docs/api/rate-limits' },
      ],
    },
    {
      icon: Database,
      title: 'Data Models',
      description: 'Understanding data structures',
      links: [
        { label: 'Users', href: '/docs/models/users' },
        { label: 'Courses', href: '/docs/models/courses' },
        { label: 'Enrollments', href: '/docs/models/enrollments' },
        { label: 'Payments', href: '/docs/models/payments' },
      ],
    },
    {
      icon: Lock,
      title: 'Authentication',
      description: 'Securing your integrations',
      links: [
        { label: 'OAuth 2.0', href: '/docs/auth/oauth' },
        { label: 'API Keys', href: '/docs/auth/api-keys' },
        { label: 'JWT Tokens', href: '/docs/auth/jwt' },
        { label: 'Permissions', href: '/docs/auth/permissions' },
      ],
    },
    {
      icon: Zap,
      title: 'Webhooks',
      description: 'Real-time event notifications',
      links: [
        { label: 'Overview', href: '/docs/webhooks/overview' },
        { label: 'Event Types', href: '/docs/webhooks/events' },
        { label: 'Security', href: '/docs/webhooks/security' },
        { label: 'Testing', href: '/docs/webhooks/testing' },
      ],
    },
    {
      icon: Globe,
      title: 'SDKs & Libraries',
      description: 'Official client libraries',
      links: [
        { label: 'JavaScript/TypeScript', href: '/docs/sdks/javascript' },
        { label: 'Python', href: '/docs/sdks/python' },
        { label: 'PHP', href: '/docs/sdks/php' },
        { label: 'Ruby', href: '/docs/sdks/ruby' },
      ],
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('quickStart')}</h2>
            <div className="p-6 rounded-xl border border-border bg-card">
              <p className="text-muted-foreground mb-4">
                Get started with the LEAP PM API in minutes. Install our SDK and make your first API call.
              </p>
              <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code>
                  {`# Install the SDK
npm install @leappm/sdk

# Initialize the client
import { LeapPM } from '@leappm/sdk';

const client = new LeapPM({
  apiKey: 'your-api-key'
});

# Fetch courses
const courses = await client.courses.list();`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">{t('browseDocumentation')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.title}
                  className="p-6 rounded-2xl border border-border bg-card"
                >
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-border/50 mb-4">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {section.description}
                  </p>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* API Status */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('apiStatus')}</h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
              <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-500"></div>
              All Systems Operational
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              99.99% uptime over the last 30 days
            </p>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('needDeveloperSupport')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t('needDeveloperSupportDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://github.com/leappm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium"
            >
              View on GitHub
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
            >
              {t('contactSupport')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
