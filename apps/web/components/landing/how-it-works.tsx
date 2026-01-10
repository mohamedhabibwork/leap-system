'use client';

import { UserPlus, Search, GraduationCap, Award, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useScrollReveal, useInView } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';

function TimelineStep({ 
  step, 
  index, 
  t,
  isLast 
}: { 
  step: any; 
  index: number; 
  t: any;
  isLast: boolean;
}) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const [lineRef, lineVisible] = useInView<HTMLDivElement>({ threshold: 0.5 });
  const Icon = step.icon;

  return (
    <div
      ref={ref}
      className={`relative ${getScrollRevealClass(isVisible)}`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex gap-6 md:gap-8">
        {/* Timeline */}
        <div className="flex flex-col items-center">
          {/* Step Circle */}
          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
            <span className="text-lg font-bold">{step.step}</span>
          </div>
          
          {/* Connecting Line */}
          {!isLast && (
            <div 
              ref={lineRef}
              className="w-0.5 h-full min-h-[120px] mt-2 bg-gradient-to-b from-blue-300 to-purple-300 dark:from-blue-700 dark:to-purple-700 relative overflow-hidden"
            >
              <div 
                className="absolute inset-0 bg-gradient-to-b from-blue-600 to-purple-600 transition-transform duration-1000 origin-top"
                style={{
                  transform: lineVisible ? 'scaleY(1)' : 'scaleY(0)',
                }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pb-12">
          <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-border/50 group-hover:scale-110 transition-transform duration-300">
                <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t(step.titleKey as any)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(step.descriptionKey as any)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const t = useTranslations('landing.howItWorks');
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  const steps = [
    {
      icon: UserPlus,
      titleKey: 'steps.signUp.title',
      descriptionKey: 'steps.signUp.description',
      step: '01',
    },
    {
      icon: Search,
      titleKey: 'steps.explore.title',
      descriptionKey: 'steps.explore.description',
      step: '02',
    },
    {
      icon: GraduationCap,
      titleKey: 'steps.learn.title',
      descriptionKey: 'steps.learn.description',
      step: '03',
    },
    {
      icon: Award,
      titleKey: 'steps.certify.title',
      descriptionKey: 'steps.certify.description',
      step: '04',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={headerRef}
          className={`text-center space-y-4 mb-20 ${getScrollRevealClass(headerVisible)}`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-0">
          {steps.map((step, index) => (
            <TimelineStep 
              key={step.titleKey} 
              step={step} 
              index={index} 
              t={t}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/register"
            className="group inline-flex items-center px-8 py-4 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            {t('cta')}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}
