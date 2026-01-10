'use client';

import { UserPlus, Search, GraduationCap, Award } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function HowItWorks() {
  const t = useTranslations('landing.howItWorks');

  const steps = [
    {
      icon: UserPlus,
      titleKey: 'steps.signUp.title',
      descriptionKey: 'steps.signUp.description',
      step: '01',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Search,
      titleKey: 'steps.explore.title',
      descriptionKey: 'steps.explore.description',
      step: '02',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: GraduationCap,
      titleKey: 'steps.learn.title',
      descriptionKey: 'steps.learn.description',
      step: '03',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Award,
      titleKey: 'steps.certify.title',
      descriptionKey: 'steps.certify.description',
      step: '04',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="py-20 bg-gradient-to-b from-muted/50 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground">
            {t('title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Lines - Hidden on mobile */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-orange-200"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.titleKey} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Step Number */}
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-lg flex items-center justify-center shadow-lg z-10`}>
                    {step.step}
                  </div>

                  {/* Icon Container */}
                  <div className={`mt-8 w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground pt-2">
                    {t(step.titleKey as any)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(step.descriptionKey as any)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/register"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {t('cta')}
          </a>
        </div>
      </div>
    </div>
  );
}
