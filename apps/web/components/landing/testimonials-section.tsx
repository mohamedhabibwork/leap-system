'use client';

import { Star, Quote } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function TestimonialsSection() {
  const t = useTranslations('landing.testimonials');

  const testimonials = [
    {
      nameKey: 'items.sarah.name',
      roleKey: 'items.sarah.role',
      contentKey: 'items.sarah.content',
      rating: 5,
    },
    {
      nameKey: 'items.michael.name',
      roleKey: 'items.michael.role',
      contentKey: 'items.michael.content',
      rating: 5,
    },
    {
      nameKey: 'items.emily.name',
      roleKey: 'items.emily.role',
      contentKey: 'items.emily.content',
      rating: 5,
    },
    {
      nameKey: 'items.david.name',
      roleKey: 'items.david.role',
      contentKey: 'items.david.content',
      rating: 5,
    },
    {
      nameKey: 'items.jessica.name',
      roleKey: 'items.jessica.role',
      contentKey: 'items.jessica.content',
      rating: 5,
    },
    {
      nameKey: 'items.ryan.name',
      roleKey: 'items.ryan.role',
      contentKey: 'items.ryan.content',
      rating: 5,
    },
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/10 dark:via-background dark:to-purple-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground">
            {t('title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => {
            const name = t(testimonial.nameKey as any);
            return (
              <div
                key={index}
                className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-border"
              >
                <div className="space-y-4">
                  {/* Quote Icon */}
                  <Quote className="h-10 w-10 text-blue-200 dark:text-blue-400/50" />

                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-card-foreground leading-relaxed">
                    "{t(testimonial.contentKey as any)}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground">{name}</p>
                      <p className="text-sm text-muted-foreground">{t(testimonial.roleKey as any)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
