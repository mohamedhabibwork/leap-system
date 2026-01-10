'use client';

import { LucideIcon } from 'lucide-react';
import { useScrollReveal } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';

interface Value {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ValuesGridProps {
  values: Value[];
}

export function ValuesGrid({ values }: ValuesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {values.map((value, index) => {
        const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
        const Icon = value.icon;

        return (
          <div
            key={value.title}
            ref={ref}
            className={`p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 ${getScrollRevealClass(
              isVisible
            )}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-border/50 mb-4">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{value.description}</p>
          </div>
        );
      })}
    </div>
  );
}
