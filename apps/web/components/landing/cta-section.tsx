'use client';

import { ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useScrollReveal } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';

export function CtaSection() {
  const t = useTranslations('landing.cta');
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="py-24 bg-foreground text-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div 
          ref={ref}
          className={`space-y-8 ${getScrollRevealClass(isVisible)}`}
        >
          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            {t('title')}
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl opacity-80 max-w-2xl mx-auto leading-relaxed">
            {t('description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              href="/register"
              className="group inline-flex items-center px-8 py-4 text-base font-semibold rounded-xl text-foreground bg-background hover:bg-background/90 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {t('primaryButton')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="/hub/courses"
              className="group inline-flex items-center px-8 py-4 text-base font-semibold rounded-xl border-2 border-current hover:bg-background/10 transition-all duration-300"
            >
              {t('secondaryButton')}
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 opacity-70 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{t('trustIndicators.noCard')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{t('trustIndicators.cancelAnytime')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{t('trustIndicators.moneyBack')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    </section>
  );
}
