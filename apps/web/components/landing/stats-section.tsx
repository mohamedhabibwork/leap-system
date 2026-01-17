'use client';

import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useScrollReveal } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';

function StatCard({ 
  stat, 
  index, 
  t,
  value,
  suffix 
}: { 
  stat: any; 
  index: number; 
  t: any;
  value: number;
  suffix: string;
}) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const Icon = stat.icon;

  // Simple counter animation using CSS animation
  return (
    <div
      ref={ref}
      className={`text-center space-y-4 p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 ${getScrollRevealClass(
        isVisible
      )}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="inline-flex p-4 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors duration-300">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <div className="text-5xl font-bold">
        {isVisible && (
          <span className="inline-block animate-in zoom-in duration-1000">
            {value.toLocaleString()}{suffix}
          </span>
        )}
        {!isVisible && (
          <span className="opacity-0">0{suffix}</span>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-xl font-semibold text-white">
          {t(stat.labelKey )}
        </div>
        <div className="text-sm text-blue-100">
          {t(stat.descriptionKey )}
        </div>
      </div>
    </div>
  );
}

export function StatsSection() {
  const t = useTranslations('landing.stats');
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  // Extract numeric values from translations or use defaults
  const stats = [
    {
      icon: Users,
      value: 50000,
      suffix: '+',
      valueKey: 'activeStudents.value',
      labelKey: 'activeStudents.label',
      descriptionKey: 'activeStudents.description',
    },
    {
      icon: BookOpen,
      value: 1000,
      suffix: '+',
      valueKey: 'coursesAvailable.value',
      labelKey: 'coursesAvailable.label',
      descriptionKey: 'coursesAvailable.description',
    },
    {
      icon: GraduationCap,
      value: 500,
      suffix: '+',
      valueKey: 'instructors.value',
      labelKey: 'instructors.label',
      descriptionKey: 'instructors.description',
    },
    {
      icon: TrendingUp,
      value: 95,
      suffix: '%',
      valueKey: 'successRate.value',
      labelKey: 'successRate.label',
      descriptionKey: 'successRate.description',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={headerRef}
          className={`text-center space-y-4 mb-16 ${getScrollRevealClass(headerVisible)}`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            {t('title')}
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <StatCard 
              key={stat.labelKey} 
              stat={stat} 
              index={index} 
              t={t}
              value={stat.value}
              suffix={stat.suffix}
            />
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
    </section>
  );
}
