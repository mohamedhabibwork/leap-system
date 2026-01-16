import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Heart, Users, Zap, Target, Award, Globe } from 'lucide-react';
import { TeamMemberCard } from '@/components/marketing/team-member-card';
import { ValuesGrid } from '@/components/marketing/values-grid';
import { MilestoneTimeline } from '@/components/marketing/milestone-timeline';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Us | LEAP PM',
  description: 'Learn about LEAP PM, our mission, team, and journey to revolutionize online learning.',
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('marketing.about');

  const values = [
    {
      icon: Heart,
      title: t('values.studentCentered.title'),
      description: t('values.studentCentered.description'),
    },
    {
      icon: Zap,
      title: t('values.innovation.title'),
      description: t('values.innovation.description'),
    },
    {
      icon: Users,
      title: t('values.community.title'),
      description: t('values.community.description'),
    },
    {
      icon: Target,
      title: t('values.excellence.title'),
      description: t('values.excellence.description'),
    },
    {
      icon: Award,
      title: t('values.integrity.title'),
      description: t('values.integrity.description'),
    },
    {
      icon: Globe,
      title: t('values.accessibility.title'),
      description: t('values.accessibility.description'),
    },
  ];

  const milestones = [
    {
      year: '2020',
      title: t('milestones.beginning.title'),
      description: t('milestones.beginning.description'),
    },
    {
      year: '2021',
      title: t('milestones.firstThousand.title'),
      description: t('milestones.firstThousand.description'),
    },
    {
      year: '2022',
      title: t('milestones.expansion.title'),
      description: t('milestones.expansion.description'),
    },
    {
      year: '2023',
      title: t('milestones.aiIntegration.title'),
      description: t('milestones.aiIntegration.description'),
    },
    {
      year: '2024',
      title: t('milestones.fiftyThousand.title'),
      description: t('milestones.fiftyThousand.description'),
    },
  ];

  const team = [
    {
      name: t('team.sarah.name'),
      role: t('team.sarah.role'),
      bio: t('team.sarah.bio'),
    },
    {
      name: t('team.michael.name'),
      role: t('team.michael.role'),
      bio: t('team.michael.bio'),
    },
    {
      name: t('team.emily.name'),
      role: t('team.emily.role'),
      bio: t('team.emily.bio'),
    },
    {
      name: t('team.david.name'),
      role: t('team.david.role'),
      bio: t('team.david.bio'),
    },
    {
      name: t('team.jessica.name'),
      role: t('team.jessica.role'),
      bio: t('team.jessica.bio'),
    },
    {
      name: t('team.ryan.name'),
      role: t('team.ryan.role'),
      bio: t('team.ryan.bio'),
    },
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
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('values.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('values.subtitle')}
            </p>
          </div>
          <ValuesGrid values={values} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">50K+</div>
              <div className="text-muted-foreground">{t('stats.activeLearners')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">1K+</div>
              <div className="text-muted-foreground">{t('stats.courses')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">500+</div>
              <div className="text-muted-foreground">{t('stats.instructors')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">50+</div>
              <div className="text-muted-foreground">{t('stats.countries')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('journey.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('journey.subtitle')}
            </p>
          </div>
          <MilestoneTimeline milestones={milestones} />
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('team.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('team.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {team.map((member, index) => (
              <TeamMemberCard key={member.name} {...member} index={index} />
            ))}
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                {t('cta.startLearning')}
              </Button>
            </Link>
            <Link href="/become-instructor">
              <Button size="lg" variant="outline" className="min-w-[200px] border-current hover:bg-background/10">
                {t('cta.becomeInstructor')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
