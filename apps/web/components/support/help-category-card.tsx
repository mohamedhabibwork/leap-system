'use client';

import { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useScrollReveal } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';

interface HelpCategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  articleCount: number;
  index?: number;
}

export function HelpCategoryCard({
  title,
  description,
  icon: Icon,
  href,
  articleCount,
  index = 0,
}: HelpCategoryCardProps) {
  const [ref, isVisible] = useScrollReveal<HTMLAnchorElement>({ threshold: 0.2 });

  return (
    <Link
      ref={ref}
      href={href}
      className={`group block p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 ${getScrollRevealClass(
        isVisible
      )}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-border/50 mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {description}
      </p>
      <div className="text-xs text-muted-foreground">
        {articleCount} {articleCount === 1 ? 'article' : 'articles'}
      </div>
    </Link>
  );
}
