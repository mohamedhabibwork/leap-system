'use client';

import { Check, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function PricingSection() {
  const t = useTranslations('landing.pricing');

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
      href: '/register',
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
    <div className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground">
            {t('title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.nameKey}
              className={`relative rounded-2xl ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105 dark:from-blue-500 dark:to-purple-500'
                  : 'bg-card text-card-foreground border-2 border-border'
              } p-8 hover:shadow-xl transition-all duration-300`}
            >
              {plan.highlighted && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-500 dark:to-orange-500 text-gray-900 dark:text-gray-100 text-sm font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  {t('mostPopular')}
                </div>
              )}

              <div className="space-y-6">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold">{t(plan.nameKey as any)}</h3>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  {plan.priceKey ? (
                    <span className="text-4xl font-extrabold">{t(plan.priceKey as any)}</span>
                  ) : (
                    <>
                      <span className="text-5xl font-extrabold">${plan.price}</span>
                      <span className={plan.highlighted ? 'text-blue-100' : 'text-muted-foreground'}>
                        {t('monthLabel')}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className={plan.highlighted ? 'text-blue-100' : 'text-muted-foreground'}>
                  {t(plan.descriptionKey as any)}
                </p>

                {/* Features */}
                <ul className="space-y-3 py-6">
                  {plan.features.map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-3">
                      <Check
                        className={`h-5 w-5 flex-shrink-0 ${
                          plan.highlighted ? 'text-blue-200' : 'text-green-500'
                        }`}
                      />
                      <span className={plan.highlighted ? 'text-blue-50' : 'text-foreground'}>
                        {t(featureKey as any)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href={plan.href}>
                  <button
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      plan.highlighted
                        ? 'bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-700 hover:bg-blue-50 dark:hover:bg-gray-200'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600'
                    }`}
                  >
                    {t(plan.ctaKey as any)}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center text-muted-foreground">
          <p>{t('additionalInfo.line1')}</p>
          <p className="mt-2">
            {t('additionalInfo.line2')}{' '}
            <a href="/contact" className="text-primary hover:text-primary/80 font-semibold">
              {t('additionalInfo.contactLink')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
