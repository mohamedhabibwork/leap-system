import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { LegalDocument, LegalSection } from '@/components/legal/legal-document';
import { TableOfContents } from '@/components/legal/table-of-contents';

export const metadata: Metadata = {
  title: 'Terms of Service | LEAP PM',
  description: 'Terms and conditions for using LEAP PM platform.',
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal.terms');

  const sections = [
    { id: 'acceptance', title: t('sections.acceptance') },
    { id: 'services', title: t('sections.services') },
    { id: 'registration', title: t('sections.registration') },
    { id: 'content', title: t('sections.content') },
    { id: 'intellectual-property', title: t('sections.intellectualProperty') },
    { id: 'prohibited-conduct', title: t('sections.prohibitedConduct') },
    { id: 'payments', title: t('sections.payments') },
    { id: 'termination', title: t('sections.termination') },
    { id: 'disclaimers', title: t('sections.disclaimers') },
    { id: 'limitation', title: t('sections.limitation') },
    { id: 'governing-law', title: t('sections.governingLaw') },
    { id: 'contact', title: t('sections.contact') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1">
          <TableOfContents items={sections} />
        </aside>

        <div className="lg:col-span-3">
          <LegalDocument title={t('title')} lastUpdated={t('lastUpdated')}>
            <LegalSection id="acceptance" title="Acceptance of Terms">
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using LEAP PM, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We reserve the right to modify these terms at any time, and continued use of the platform constitutes acceptance of modified terms.
              </p>
            </LegalSection>

            <LegalSection id="services" title="Description of Services">
              <p className="text-muted-foreground leading-relaxed mb-4">
                LEAP PM provides an online learning management system that enables:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Students to access educational courses and content</li>
                <li>Instructors to create and publish courses</li>
                <li>Social learning features and community interaction</li>
                <li>Progress tracking and certification</li>
                <li>Live sessions and events</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We reserve the right to modify, suspend, or discontinue any part of our services at any time.
              </p>
            </LegalSection>

            <LegalSection id="registration" title="User Registration">
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Be responsible for all activities under your account</li>
                <li>Be at least 13 years old (or have parental consent)</li>
              </ul>
            </LegalSection>

            <LegalSection id="content" title="User Content">
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of content you submit to LEAP PM. However, by submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content in connection with operating and providing our services. You represent that you have all necessary rights to grant this license and that your content does not infringe on third-party rights.
              </p>
            </LegalSection>

            <LegalSection id="intellectual-property" title="Intellectual Property">
              <p className="text-muted-foreground leading-relaxed">
                All content on LEAP PM, including text, graphics, logos, software, and course materials, is owned by LEAP PM or its content creators and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without explicit permission.
              </p>
            </LegalSection>

            <LegalSection id="prohibited-conduct" title="Prohibited Conduct">
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Share account credentials</li>
                <li>Download or scrape content without authorization</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload malicious code or viruses</li>
                <li>Engage in fraudulent activities</li>
                <li>Circumvent security measures</li>
              </ul>
            </LegalSection>

            <LegalSection id="payments" title="Payments and Refunds">
              <p className="text-muted-foreground leading-relaxed">
                Course prices are set by instructors. All payments are processed securely through third-party payment processors. We offer a 14-day money-back guarantee for course purchases. Subscriptions renew automatically unless cancelled. Refund requests must be submitted within the refund period and meet our refund policy criteria.
              </p>
            </LegalSection>

            <LegalSection id="termination" title="Termination">
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our sole discretion. Upon termination, your right to access the platform will cease immediately. You may also terminate your account at any time by contacting support.
              </p>
            </LegalSection>

            <LegalSection id="disclaimers" title="Disclaimers">
              <p className="text-muted-foreground leading-relaxed">
                LEAP PM is provided "as is" without warranties of any kind. We do not guarantee that the platform will be uninterrupted, secure, or error-free. We do not endorse or guarantee the accuracy of user-generated content or course materials. Educational outcomes are not guaranteed.
              </p>
            </LegalSection>

            <LegalSection id="limitation" title="Limitation of Liability">
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, LEAP PM and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability shall not exceed the amount you paid us in the past 12 months.
              </p>
            </LegalSection>

            <LegalSection id="governing-law" title="Governing Law">
              <p className="text-muted-foreground leading-relaxed">
                These terms are governed by the laws of California, United States, without regard to conflict of law provisions. Any disputes shall be resolved through binding arbitration in San Francisco, California.
              </p>
            </LegalSection>

            <LegalSection id="contact" title="Contact Information">
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, contact us at legal@leappm.com.
              </p>
            </LegalSection>
          </LegalDocument>
        </div>
      </div>
    </div>
  );
}
