'use client';

import { 
  BookOpen, 
  Users, 
  Award, 
  MessageCircle, 
  BarChart3, 
  Calendar,
  Briefcase,
  CreditCard,
  Video,
  Shield
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useScrollReveal } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';

function FeatureCard({ 
  feature, 
  index, 
  t 
}: { 
  feature: any; 
  index: number; 
  t: any;
}) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`group p-8 rounded-2xl border border-border/50 hover:border-border bg-card hover:shadow-lg transition-all duration-500 ${getScrollRevealClass(
        isVisible
      )}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="space-y-4">
        <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-border/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-card-foreground">
          {t(feature.titleKey )}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {t(feature.descriptionKey )}
        </p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const t = useTranslations('landing.features');
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  const features = [
    {
      icon: BookOpen,
      titleKey: 'items.courseManagement.title',
      descriptionKey: 'items.courseManagement.description',
    },
    {
      icon: Users,
      titleKey: 'items.socialLearning.title',
      descriptionKey: 'items.socialLearning.description',
    },
    {
      icon: Award,
      titleKey: 'items.certificates.title',
      descriptionKey: 'items.certificates.description',
    },
    {
      icon: MessageCircle,
      titleKey: 'items.chat.title',
      descriptionKey: 'items.chat.description',
    },
    {
      icon: BarChart3,
      titleKey: 'items.analytics.title',
      descriptionKey: 'items.analytics.description',
    },
    {
      icon: Calendar,
      titleKey: 'items.liveSessions.title',
      descriptionKey: 'items.liveSessions.description',
    },
    {
      icon: Briefcase,
      titleKey: 'items.jobBoard.title',
      descriptionKey: 'items.jobBoard.description',
    },
    {
      icon: CreditCard,
      titleKey: 'items.payments.title',
      descriptionKey: 'items.payments.description',
    },
    {
      icon: Video,
      titleKey: 'items.richMedia.title',
      descriptionKey: 'items.richMedia.description',
    },
    {
      icon: Shield,
      titleKey: 'items.security.title',
      descriptionKey: 'items.security.description',
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={headerRef}
          className={`text-center space-y-4 mb-16 ${getScrollRevealClass(headerVisible)}`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.titleKey} 
              feature={feature} 
              index={index} 
              t={t} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
