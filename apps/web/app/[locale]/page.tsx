import type { Metadata } from 'next';
import { use } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { AdContainer } from '@/components/ads';
import { generatePageMetadata, formatJsonLd, generateOrganizationSchema } from '@/lib/seo/utils';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { StatsSection } from '@/components/landing/stats-section';
import { CtaSection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = generatePageMetadata(
  'LEAP PM - Modern Learning Management System',
  'Empower your education journey with LEAP PM. Create, manage, and scale your online learning platform with comprehensive course management, social learning, certifications, and analytics.',
  {
    keywords: [
      'LMS platform',
      'learning management system',
      'online education',
      'e-learning software',
      'course management',
      'virtual classroom',
      'student engagement',
      'instructor tools',
      'educational technology',
      'distance learning',
    ],
  }
);

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  
  const organizationSchema = generateOrganizationSchema();
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: formatJsonLd(organizationSchema) }}
      />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <HeroSection />

        {/* Ad Banner */}
        <div className="py-8 flex justify-center bg-gray-50">
          <AdContainer
            placement="homepage_hero"
            type="banner"
            width={728}
            height={90}
          />
        </div>

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works */}
        <HowItWorks />

        {/* Stats Section */}
        <StatsSection />

        {/* Ad Banner */}
        <div className="py-8 flex justify-center bg-white">
          <AdContainer
            placement="homepage_features"
            type="banner"
            width={728}
            height={90}
          />
        </div>

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Pricing */}
        <PricingSection />

        {/* Final CTA */}
        <CtaSection />

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
