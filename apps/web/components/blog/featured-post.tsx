'use client';

import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useScrollReveal } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';

interface FeaturedPostProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  slug: string;
  featuredImage?: string;
}

export function FeaturedPost({
  title,
  excerpt,
  author,
  date,
  readTime,
  category,
  slug,
  featuredImage,
}: FeaturedPostProps) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all duration-300 ${getScrollRevealClass(
        isVisible
      )}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
          {featuredImage ? (
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-bold text-muted-foreground opacity-50">
                {title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium shadow-lg">
              Featured
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium mb-4 w-fit">
            {category}
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
            {title}
          </h2>

          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            {excerpt}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {author}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {date}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {readTime}
            </div>
          </div>

          <Link
            href={`/blog/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium w-fit group"
          >
            Read Article
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
