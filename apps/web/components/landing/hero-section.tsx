'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, PlayCircle, Users, BookOpen, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParallax } from '@/lib/hooks/use-scroll-animation';
import { getParallaxTransform, getSafeAnimationClass } from '@/lib/utils/animation-variants';

export function HeroSection() {
  const t = useTranslations('landing.hero');
  const [mounted, setMounted] = useState(false);
  const [blob1Ref, blob1Offset] = useParallax<HTMLDivElement>(0.3);
  const [blob2Ref, blob2Offset] = useParallax<HTMLDivElement>(0.5);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/20 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 backdrop-blur-sm ${
              mounted ? getSafeAnimationClass('animate-in fade-in slide-in-from-top-4 duration-700') : 'opacity-0'
            }`}
            style={{ animationDelay: '100ms' }}
          >
            <Sparkles className="h-4 w-4" />
            {t('badge')}
          </div>

          {/* Headline */}
          <h1 
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight ${
              mounted ? getSafeAnimationClass('animate-in fade-in slide-in-from-bottom-6 duration-700') : 'opacity-0'
            }`}
            style={{ animationDelay: '200ms' }}
          >
            <span className="block mb-2">{t('headline')}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-[length:200%_auto] animate-gradient">
              {t('brandName')}
            </span>
          </h1>

          {/* Subheadline */}
          <p 
            className={`max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed ${
              mounted ? getSafeAnimationClass('animate-in fade-in slide-in-from-bottom-4 duration-700') : 'opacity-0'
            }`}
            style={{ animationDelay: '300ms' }}
          >
            {t('subheadline')}
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 ${
              mounted ? getSafeAnimationClass('animate-in fade-in zoom-in-95 duration-500') : 'opacity-0'
            }`}
            style={{ animationDelay: '400ms' }}
          >
            <Link
              href="/register"
              className="group inline-flex items-center px-8 py-4 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {t('cta.primary')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="/hub/courses"
              className="group inline-flex items-center px-8 py-4 text-base font-semibold rounded-xl text-foreground bg-background border-2 border-border hover:border-foreground/20 hover:bg-muted/50 transition-all duration-300"
            >
              <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              {t('cta.secondary')}
            </Link>
          </div>

          {/* Social Proof */}
          <div 
            className={`flex flex-wrap items-center justify-center gap-8 sm:gap-12 pt-8 text-sm ${
              mounted ? getSafeAnimationClass('animate-in fade-in duration-700') : 'opacity-0'
            }`}
            style={{ animationDelay: '500ms' }}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>
                <strong className="text-foreground font-semibold">50,000+</strong> {t('socialProof.learners', { count: '50,000' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>
                <strong className="text-foreground font-semibold">1,000+</strong> {t('socialProof.courses', { count: '1,000' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <PlayCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span>
                <strong className="text-foreground font-semibold">100K+</strong> {t('socialProof.lessons', { count: '100,000' })}
              </span>
            </div>
          </div>

          {/* Trust Indicators */}
          <p 
            className={`text-xs text-muted-foreground pt-2 ${
              mounted ? getSafeAnimationClass('animate-in fade-in duration-700') : 'opacity-0'
            }`}
            style={{ animationDelay: '600ms' }}
          >
            {t('trustIndicators')}
          </p>
        </div>
      </div>

      {/* Decorative Parallax Elements */}
      <div 
        ref={blob1Ref}
        className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] pointer-events-none"
        style={{ transform: getParallaxTransform(-blob1Offset) }}
      >
        <div className="w-full h-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
      </div>
      <div 
        ref={blob2Ref}
        className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] pointer-events-none"
        style={{ transform: getParallaxTransform(-blob2Offset) }}
      >
        <div className="w-full h-full bg-gradient-to-tr from-purple-400/20 via-pink-400/20 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] pointer-events-none"></div>
    </section>
  );
}
