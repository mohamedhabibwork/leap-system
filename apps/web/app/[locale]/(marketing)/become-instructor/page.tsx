import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { DollarSign, Users, BarChart3, Calendar, Award, Video } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Become an Instructor | LEAP PM',
  description: 'Share your knowledge and earn money by teaching on LEAP PM. Join thousands of successful instructors.',
};

export default async function BecomeInstructorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('marketing.becomeInstructor');

  const benefits = [
    {
      icon: DollarSign,
      title: 'Earn Money',
      description: 'Set your own prices and earn up to 70% revenue share on every course sale',
    },
    {
      icon: Users,
      title: 'Reach Students Globally',
      description: 'Access a global audience of 50,000+ active learners across 50+ countries',
    },
    {
      icon: BarChart3,
      title: 'Track Your Performance',
      description: 'Get detailed analytics on student engagement, course performance, and revenue',
    },
    {
      icon: Calendar,
      title: 'Flexible Schedule',
      description: 'Create and teach on your own schedule with complete freedom and flexibility',
    },
    {
      icon: Award,
      title: 'Build Your Brand',
      description: 'Establish yourself as an expert and grow your professional reputation',
    },
    {
      icon: Video,
      title: 'Easy Content Creation',
      description: 'Upload videos, documents, and quizzes with our intuitive course builder',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Apply to Become an Instructor',
      description: 'Fill out our simple application form and tell us about your expertise',
    },
    {
      number: '02',
      title: 'Get Approved',
      description: 'Our team reviews your application (usually within 2-3 business days)',
    },
    {
      number: '03',
      title: 'Create Your Course',
      description: 'Use our course builder to create engaging content with videos, quizzes, and more',
    },
    {
      number: '04',
      title: 'Publish & Earn',
      description: 'Once approved, your course goes live and you start earning from student enrollments',
    },
  ];

  const requirements = [
    'Expertise or professional experience in your teaching area',
    'Passion for teaching and helping others learn',
    'Ability to create high-quality video content',
    'Commitment to student success and engagement',
    'Good communication skills',
    'Reliable internet connection for content upload',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
              {t('hero.title')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {t('hero.subtitle')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {t('hero.description')}
            </p>
            <Button size="lg" asChild>
              <Link href="/contact?subject=Instructor Application">
                {t('hero.applyButton')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('benefits.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('benefits.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300"
                >
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-border/50 mb-4">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-2xl border border-border bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {t('earnings.title')}
              </h2>
              <p className="text-muted-foreground">
                {t('earnings.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-foreground mb-2">$500+</div>
                <div className="text-sm text-muted-foreground">{t('earnings.averageIncome')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-foreground mb-2">$2,500+</div>
                <div className="text-sm text-muted-foreground">{t('earnings.topInstructors')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-foreground mb-2">70%</div>
                <div className="text-sm text-muted-foreground">{t('earnings.revenueShare')}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-6">
              {t('earnings.disclaimer')}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('requirements.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('requirements.subtitle')}
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-border bg-card">
            <ul className="space-y-4">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold mt-0.5">
                    ✓
                  </div>
                  <span className="text-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-foreground text-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/contact?subject=Instructor Application">
              {t('cta.button')}
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
