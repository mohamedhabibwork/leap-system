import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { FAQAccordion } from '@/components/support/faq-accordion';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'FAQ | LEAP PM',
  description: 'Frequently asked questions about LEAP PM.',
};

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('support.faqPage');

  const generalFAQs = [
    {
      question: 'What is LEAP PM?',
      answer: 'LEAP PM is a comprehensive learning management system that connects students with expert instructors. We offer thousands of courses across various subjects, from technology and business to creative arts and personal development.',
    },
    {
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button in the top right corner of any page. You can register using your email address or sign in with Google, Facebook, or other social accounts. It only takes a few seconds to get started.',
    },
    {
      question: 'Is LEAP PM free to use?',
      answer: 'Creating an account is free. We offer both free and paid courses. You can browse our course catalog and enroll in free courses at no cost. Premium courses require payment, but we offer a 14-day money-back guarantee.',
    },
    {
      question: 'Can I access courses on mobile devices?',
      answer: 'Yes! LEAP PM is fully responsive and works on all devices. We also have dedicated mobile apps for iOS and Android that you can download from the App Store or Google Play.',
    },
  ];

  const coursesFAQs = [
    {
      question: 'How do I enroll in a course?',
      answer: 'Browse our course catalog, click on a course you\'re interested in, and click the "Enroll Now" button. For paid courses, you\'ll be prompted to complete payment. Once enrolled, the course will appear in your dashboard.',
    },
    {
      question: 'Can I preview courses before enrolling?',
      answer: 'Yes! Most courses offer preview videos and a detailed curriculum overview. You can see what topics are covered and watch sample lessons before making a purchase decision.',
    },
    {
      question: 'How long do I have access to a course?',
      answer: 'Once you enroll in a course, you have lifetime access to all course materials. You can learn at your own pace and revisit content whenever you need a refresher.',
    },
    {
      question: 'Do I get a certificate after completing a course?',
      answer: 'Yes! Upon completing a course and passing any required assessments, you\'ll receive a digital certificate that you can share on LinkedIn, add to your resume, or download as a PDF.',
    },
  ];

  const paymentFAQs = [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and various local payment methods depending on your region. All payments are processed securely through industry-standard encryption.',
    },
    {
      question: 'What is your refund policy?',
      answer: 'We offer a 14-day money-back guarantee on all paid courses. If you\'re not satisfied with a course, you can request a full refund within 14 days of purchase. Refunds are typically processed within 5-7 business days.',
    },
    {
      question: 'Do you offer student discounts?',
      answer: 'Yes! Students with a valid .edu email address are eligible for up to 30% off on select courses. We also run regular promotions and sales throughout the year.',
    },
    {
      question: 'Can I purchase courses as a gift?',
      answer: 'Absolutely! You can purchase gift cards in various denominations or gift specific courses directly to someone else. Just select the gift option during checkout.',
    },
  ];

  const instructorFAQs = [
    {
      question: 'How do I become an instructor?',
      answer: 'Visit our "Become an Instructor" page and submit an application. We\'ll review your credentials and experience. Once approved, you\'ll get access to our course creation tools and instructor dashboard.',
    },
    {
      question: 'How much can I earn as an instructor?',
      answer: 'Instructors earn up to 70% revenue share on course sales. Your earnings depend on your course pricing, the number of students, and your marketing efforts. Top instructors earn $2,500+ per month.',
    },
    {
      question: 'What equipment do I need to create a course?',
      answer: 'You\'ll need a decent microphone, a camera (or screen recording software for technical courses), and good lighting. We provide detailed guides on equipment recommendations for every budget.',
    },
    {
      question: 'How long does it take to create a course?',
      answer: 'It varies depending on course length and complexity. Most instructors complete a course within 4-8 weeks. Our course creation tools make it easy to upload videos, create quizzes, and organize your content.',
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

      {/* FAQ Sections */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <FAQAccordion items={generalFAQs} category="General Questions" />
          <FAQAccordion items={coursesFAQs} category="Courses & Learning" />
          <FAQAccordion items={paymentFAQs} category="Payments & Billing" />
          <FAQAccordion items={instructorFAQs} category="For Instructors" />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('stillHaveQuestions')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t('stillHaveQuestionsDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">{t('contactSupport')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/help">{t('browseHelpCenter')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
