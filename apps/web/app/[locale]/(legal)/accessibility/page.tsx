import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { LegalDocument, LegalSection } from '@/components/legal/legal-document';
import { TableOfContents } from '@/components/legal/table-of-contents';

export const metadata: Metadata = {
  title: 'Accessibility Statement | LEAP PM',
  description: 'Our commitment to making LEAP PM accessible to everyone.',
};

export default async function AccessibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal.accessibility');

  const sections = [
    { id: 'commitment', title: t('sections.commitment') },
    { id: 'standards', title: t('sections.standards') },
    { id: 'features', title: t('sections.features') },
    { id: 'assistive-technology', title: t('sections.assistiveTechnology') },
    { id: 'limitations', title: t('sections.limitations') },
    { id: 'feedback', title: t('sections.feedback') },
    { id: 'continuous-improvement', title: t('sections.continuousImprovement') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1">
          <TableOfContents items={sections} />
        </aside>

        <div className="lg:col-span-3">
          <LegalDocument title={t('title')} lastUpdated={t('lastUpdated')}>
            <LegalSection id="commitment" title="Our Commitment">
              <p className="text-muted-foreground leading-relaxed">
                LEAP PM is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to ensure we provide equal access to all of our users.
              </p>
            </LegalSection>

            <LegalSection id="standards" title="Accessibility Standards">
              <p className="text-muted-foreground leading-relaxed mb-4">
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with disabilities and user-friendly for everyone.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The WCAG guidelines have three levels of accessibility (A, AA, and AAA). We have chosen Level AA as our target conformance level as it addresses the most common barriers for disabled users.
              </p>
            </LegalSection>

            <LegalSection id="features" title="Accessibility Features">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our platform includes the following accessibility features:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Keyboard Navigation:</strong> All functionality is accessible via keyboard</li>
                <li><strong>Screen Reader Support:</strong> Compatible with popular screen readers (JAWS, NVDA, VoiceOver)</li>
                <li><strong>Text Alternatives:</strong> Images and non-text content have text alternatives</li>
                <li><strong>Clear Structure:</strong> Semantic HTML and proper heading hierarchy</li>
                <li><strong>Color Contrast:</strong> Sufficient contrast ratios for text and interactive elements</li>
                <li><strong>Resizable Text:</strong> Text can be resized up to 200% without loss of functionality</li>
                <li><strong>Focus Indicators:</strong> Visible focus indicators for keyboard navigation</li>
                <li><strong>ARIA Labels:</strong> Appropriate ARIA labels for complex interactions</li>
                <li><strong>Captions:</strong> Video content includes closed captions where available</li>
                <li><strong>Transcripts:</strong> Audio content includes text transcripts</li>
                <li><strong>Reduced Motion:</strong> Respects prefers-reduced-motion settings</li>
              </ul>
            </LegalSection>

            <LegalSection id="assistive-technology" title="Assistive Technology">
              <p className="text-muted-foreground leading-relaxed mb-4">
                LEAP PM is designed to be compatible with the following assistive technologies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Screen readers (JAWS, NVDA, VoiceOver, TalkBack)</li>
                <li>Screen magnification software</li>
                <li>Speech recognition software</li>
                <li>Alternative input devices</li>
                <li>Browser accessibility features</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We test our platform with these technologies to ensure compatibility and usability.
              </p>
            </LegalSection>

            <LegalSection id="limitations" title="Known Limitations">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Despite our efforts, some limitations may exist:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Third-party content embedded in courses may not meet our accessibility standards</li>
                <li>Some older course content may not have captions or transcripts</li>
                <li>PDF documents uploaded by instructors may not be fully accessible</li>
                <li>Some complex interactive elements may require additional assistive technology configuration</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We are actively working to address these limitations and provide accessible alternatives where possible.
              </p>
            </LegalSection>

            <LegalSection id="feedback" title="Feedback and Contact">
              <p className="text-muted-foreground leading-relaxed mb-4">
                We welcome your feedback on the accessibility of LEAP PM. If you encounter accessibility barriers, please let us know:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground">
                <li><strong>Email:</strong> accessibility@leappm.com</li>
                <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                <li><strong>Address:</strong> 123 Innovation Drive, San Francisco, CA 94105</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We aim to respond to accessibility feedback within 5 business days and to propose a solution within 10 business days.
              </p>
            </LegalSection>

            <LegalSection id="continuous-improvement" title="Continuous Improvement">
              <p className="text-muted-foreground leading-relaxed">
                We conduct regular accessibility audits and testing to identify and address accessibility issues. Our development team receives ongoing training in accessible design and development practices. We are committed to making continuous improvements to ensure our platform is accessible to all users.
              </p>
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  <strong>Last Accessibility Audit:</strong> December 2023
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Next Scheduled Audit:</strong> June 2024
                </p>
              </div>
            </LegalSection>
          </LegalDocument>
        </div>
      </div>
    </div>
  );
}
