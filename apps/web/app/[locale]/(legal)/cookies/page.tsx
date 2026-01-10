import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LegalDocument, LegalSection } from '@/components/legal/legal-document';
import { TableOfContents } from '@/components/legal/table-of-contents';

export const metadata: Metadata = {
  title: 'Cookie Policy | LEAP PM',
  description: 'Learn about how LEAP PM uses cookies and similar technologies.',
};

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sections = [
    { id: 'what-are-cookies', title: 'What Are Cookies' },
    { id: 'types-of-cookies', title: 'Types of Cookies We Use' },
    { id: 'essential-cookies', title: 'Essential Cookies' },
    { id: 'analytics-cookies', title: 'Analytics Cookies' },
    { id: 'functional-cookies', title: 'Functional Cookies' },
    { id: 'advertising-cookies', title: 'Advertising Cookies' },
    { id: 'managing-cookies', title: 'Managing Cookies' },
    { id: 'contact', title: 'Contact Us' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1">
          <TableOfContents items={sections} />
        </aside>

        <div className="lg:col-span-3">
          <LegalDocument title="Cookie Policy" lastUpdated="January 1, 2024">
            <LegalSection id="what-are-cookies" title="What Are Cookies">
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files stored on your device when you visit websites. They help websites remember information about your visit, making your next visit easier and the site more useful to you. Cookies can store preferences, login information, and track your activity on the site.
              </p>
            </LegalSection>

            <LegalSection id="types-of-cookies" title="Types of Cookies We Use">
              <p className="text-muted-foreground leading-relaxed mb-4">
                LEAP PM uses several types of cookies for various purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period or until deleted</li>
                <li><strong>First-Party Cookies:</strong> Set by LEAP PM directly</li>
                <li><strong>Third-Party Cookies:</strong> Set by third-party services we use</li>
              </ul>
            </LegalSection>

            <LegalSection id="essential-cookies" title="Essential Cookies">
              <p className="text-muted-foreground leading-relaxed mb-4">
                These cookies are necessary for the platform to function properly:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Authentication and security cookies to keep you logged in securely</li>
                <li>Load balancing cookies to distribute traffic efficiently</li>
                <li>Session state cookies to maintain your session as you navigate</li>
                <li>Security cookies to detect authentication abuses</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                These cookies cannot be disabled as the platform would not work without them.
              </p>
            </LegalSection>

            <LegalSection id="analytics-cookies" title="Analytics Cookies">
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use analytics cookies to understand how visitors interact with our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Google Analytics: Tracks page views, user flow, and engagement metrics</li>
                <li>Internal analytics: Monitors feature usage and user behavior</li>
                <li>Performance monitoring: Tracks load times and technical performance</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                This data is used to improve our services and user experience.
              </p>
            </LegalSection>

            <LegalSection id="functional-cookies" title="Functional Cookies">
              <p className="text-muted-foreground leading-relaxed mb-4">
                These cookies enhance functionality and personalization:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Language and locale preferences</li>
                <li>Theme settings (light/dark mode)</li>
                <li>Video player settings and progress</li>
                <li>Course filters and sort preferences</li>
                <li>Notification preferences</li>
              </ul>
            </LegalSection>

            <LegalSection id="advertising-cookies" title="Advertising Cookies">
              <p className="text-muted-foreground leading-relaxed">
                We may use advertising cookies to deliver relevant advertisements. These cookies track your browsing activity across websites to build a profile of your interests. You can opt out of personalized advertising through your cookie settings or through industry opt-out tools like the Digital Advertising Alliance.
              </p>
            </LegalSection>

            <LegalSection id="managing-cookies" title="Managing Cookies">
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through their settings</li>
                <li><strong>Cookie Consent Tool:</strong> Use our cookie consent banner to manage your preferences</li>
                <li><strong>Opt-Out Tools:</strong> Use industry opt-out tools for advertising cookies</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Please note that blocking certain cookies may impact your experience and functionality of the platform.
              </p>
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  <strong>Browser-Specific Instructions:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground mt-2">
                  <li>Chrome: Settings → Privacy and Security → Cookies</li>
                  <li>Firefox: Options → Privacy & Security → Cookies</li>
                  <li>Safari: Preferences → Privacy → Cookies</li>
                  <li>Edge: Settings → Cookies and Site Permissions</li>
                </ul>
              </div>
            </LegalSection>

            <LegalSection id="contact" title="Contact Us">
              <p className="text-muted-foreground leading-relaxed">
                For questions about our use of cookies, contact us at privacy@leappm.com.
              </p>
            </LegalSection>
          </LegalDocument>
        </div>
      </div>
    </div>
  );
}
