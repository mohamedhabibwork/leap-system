import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { LegalDocument, LegalSection } from '@/components/legal/legal-document';
import { TableOfContents } from '@/components/legal/table-of-contents';

export const metadata: Metadata = {
  title: 'Privacy Policy | LEAP PM',
  description: 'Learn how LEAP PM collects, uses, and protects your personal information.',
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal.privacy');

  const sections = [
    { id: 'introduction', title: t('sections.introduction') },
    { id: 'information-collection', title: t('sections.informationCollection') },
    { id: 'information-use', title: t('sections.informationUse') },
    { id: 'information-sharing', title: t('sections.informationSharing') },
    { id: 'data-security', title: t('sections.dataSecurity') },
    { id: 'your-rights', title: t('sections.yourRights') },
    { id: 'cookies', title: t('sections.cookies') },
    { id: 'children', title: t('sections.children') },
    { id: 'changes', title: t('sections.changes') },
    { id: 'contact', title: t('sections.contact') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Table of Contents */}
        <aside className="lg:col-span-1">
          <TableOfContents items={sections} />
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <LegalDocument title={t('title')} lastUpdated={t('lastUpdated')}>
            <LegalSection id="introduction" title="Introduction">
              <p className="text-muted-foreground leading-relaxed mb-4">
                At LEAP PM, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using LEAP PM, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </LegalSection>

            <LegalSection id="information-collection" title="Information We Collect">
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect several types of information from and about users of our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Personal Information:</strong> Name, email address, postal address, phone number, and other identifiers</li>
                <li><strong>Account Information:</strong> Username, password, and profile information</li>
                <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely through third-party payment processors)</li>
                <li><strong>Usage Data:</strong> Course enrollment, progress, quiz results, and interaction data</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies</li>
                <li><strong>Communications:</strong> Messages sent through our platform, support tickets, and feedback</li>
              </ul>
            </LegalSection>

            <LegalSection id="information-use" title="How We Use Your Information">
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information, updates, and security alerts</li>
                <li>Respond to your comments, questions, and provide customer support</li>
                <li>Personalize your experience and deliver targeted content</li>
                <li>Monitor and analyze usage and trends</li>
                <li>Detect, prevent, and address technical issues and fraudulent activity</li>
                <li>Comply with legal obligations</li>
              </ul>
            </LegalSection>

            <LegalSection id="information-sharing" title="Information Sharing">
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>With Instructors:</strong> When you enroll in a course, we share your progress and performance data with the instructor</li>
                <li><strong>Service Providers:</strong> We share information with third-party service providers who perform services on our behalf</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We do not sell your personal information to third parties.
              </p>
            </LegalSection>

            <LegalSection id="data-security" title="Data Security">
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure servers, regular security assessments, and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </LegalSection>

            <LegalSection id="your-rights" title="Your Rights">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@leappm.com.
              </p>
            </LegalSection>

            <LegalSection id="cookies" title="Cookies and Tracking">
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. For more information, please see our Cookie Policy.
              </p>
            </LegalSection>

            <LegalSection id="children" title="Children's Privacy">
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </LegalSection>

            <LegalSection id="changes" title="Changes to This Policy">
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically for any changes.
              </p>
            </LegalSection>

            <LegalSection id="contact" title="Contact Us">
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground mt-4">
                <li><strong>Email:</strong> privacy@leappm.com</li>
                <li><strong>Address:</strong> 123 Innovation Drive, San Francisco, CA 94105</li>
                <li><strong>Phone:</strong> +1 (555) 123-4567</li>
              </ul>
            </LegalSection>
          </LegalDocument>
        </div>
      </div>
    </div>
  );
}
