'use client';

import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useScrollReveal } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';

interface BlogCardProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  slug: string;
  featuredImage?: string;
  index?: number;
}

export function BlogCard({
  title,
  excerpt,
  author,
  date,
  readTime,
  category,
  slug,
  featuredImage,
  index = 0,
}: BlogCardProps) {
  const [ref, isVisible] = useScrollReveal<HTMLAnchorElement>({ threshold: 0.2 });

  return (
    <Link
      ref={ref}
      href={`/blog/${slug}`}
      className={`group block rounded-2xl border border-border bg-card hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 overflow-hidden ${getScrollRevealClass(
        isVisible
      )}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Featured Image */}
      {featuredImage ? (
        <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
          <img
            src={featuredImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
          <span className="text-4xl font-bold text-muted-foreground opacity-50">
            {title.charAt(0)}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Category */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
          {category}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-foreground line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {author}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {date}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readTime}
          </div>
        </div>

        {/* Read More */}
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all">
          Read More
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
