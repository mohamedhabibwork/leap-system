'use client';

import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useScrollReveal } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';

function PricingCard({ 
  plan, 
  index, 
  t 
}: { 
  plan: any; 
  index: number; 
  t: any;
}) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`relative rounded-2xl transition-all duration-500 ${
        plan.highlighted
          ? 'bg-foreground text-background shadow-xl scale-105 border-2 border-foreground'
          : 'bg-card text-card-foreground border border-border hover:shadow-lg'
      } ${getScrollRevealClass(isVisible)}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {plan.highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
          <Sparkles className="h-3 w-3" />
          {t('mostPopular')}
        </div>
      )}

      <div className="p-8 space-y-6">
        {/* Plan Name */}
        <h3 className="text-2xl font-semibold">{t(plan.nameKey as any)}</h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {plan.priceKey ? (
            <span className="text-3xl font-bold">{t(plan.priceKey as any)}</span>
          ) : (
            <>
              <span className="text-5xl font-bold">${plan.price}</span>
              <span className={plan.highlighted ? 'opacity-70' : 'text-muted-foreground'}>
                {t('monthLabel')}
              </span>
            </>
          )}
        </div>

        {/* Description */}
        <p className={plan.highlighted ? 'opacity-80' : 'text-muted-foreground'}>
          {t(plan.descriptionKey as any)}
        </p>

        <div className="border-t border-current opacity-10"></div>

        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((featureKey: string) => (
            <li key={featureKey} className="flex items-start gap-3">
              <Check
                className={`h-5 w-5 flex-shrink-0 ${
                  plan.highlighted ? 'opacity-80' : 'text-blue-600 dark:text-blue-400'
                }`}
              />
              <span className="text-sm">
                {t(featureKey as any)}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link href={plan.href} className="block">
          <button
            className={`group w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              plan.highlighted
                ? 'bg-background text-foreground hover:bg-background/90'
                : 'bg-foreground text-background hover:bg-foreground/90'
            }`}
          >
            {t(plan.ctaKey as any)}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </Link>
      </div>
    </div>
  );
}

export function PricingSection() {
  const t = useTranslations('landing.pricing');
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  const plans = [
    {
      nameKey: 'plans.free.name',
      price: '0',
      descriptionKey: 'plans.free.description',
      features: [
        'plans.free.features.freeCourses',
        'plans.free.features.basicFeatures',
        'plans.free.features.forumAccess',
        'plans.free.features.progressTracking',
        'plans.free.features.mobileAccess',
        'plans.free.features.emailSupport',
      ],
      ctaKey: 'plans.free.cta',
      href: '/register',
      highlighted: false,
    },
    {
      nameKey: 'plans.pro.name',
      price: '29',
      descriptionKey: 'plans.pro.description',
      features: [
        'plans.pro.features.allFree',
        'plans.pro.features.premiumCourses',
        'plans.pro.features.unlimited',
        'plans.pro.features.prioritySupport',
        'plans.pro.features.advancedAnalytics',
        'plans.pro.features.downloadable',
        'plans.pro.features.recordings',
        'plans.pro.features.certificates',
      ],
      ctaKey: 'plans.pro.cta',
      href: '/subscription',
      highlighted: true,
    },
    {
      nameKey: 'plans.enterprise.name',
      priceKey: 'plans.enterprise.price',
      descriptionKey: 'plans.enterprise.description',
      features: [
        'plans.enterprise.features.allPro',
        'plans.enterprise.features.branding',
        'plans.enterprise.features.accountManager',
        'plans.enterprise.features.sso',
        'plans.enterprise.features.api',
        'plans.enterprise.features.security',
        'plans.enterprise.features.integrations',
        'plans.enterprise.features.sla',
        'plans.enterprise.features.training',
      ],
      ctaKey: 'plans.enterprise.cta',
      href: '/contact',
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-background">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={plan.nameKey} plan={plan} index={index} t={t} />
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center text-muted-foreground text-sm space-y-2">
          <p>{t('additionalInfo.line1')}</p>
          <p>
            {t('additionalInfo.line2')}{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold underline underline-offset-4">
              {t('additionalInfo.contactLink')}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
