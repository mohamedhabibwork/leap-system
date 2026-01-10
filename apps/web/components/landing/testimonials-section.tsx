'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useScrollReveal } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';
import { Button } from '@/components/ui/button';

export function TestimonialsSection() {
  const t = useTranslations('landing.testimonials');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const timerRef = useRef<NodeJS.Timeout>();

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

  // Auto-scroll testimonials
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, testimonials.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Get visible testimonials (3 at a time on desktop)
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push({ ...testimonials[index], originalIndex: index });
    }
    return visible;
  };

  return (
    <section 
      id="testimonials" 
      className="py-24 bg-muted/30 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
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

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {getVisibleTestimonials().map((testimonial, index) => {
                const name = t(testimonial.nameKey as any);
                return (
                  <div
                    key={`${testimonial.originalIndex}-${index}`}
                    className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all duration-500 animate-in fade-in slide-in-from-right-4"
                  >
                    <div className="space-y-4">
                      {/* Quote Icon */}
                      <Quote className="h-8 w-8 text-muted-foreground/30" />

                      {/* Rating */}
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star 
                            key={i} 
                            className="h-4 w-4 fill-yellow-400 text-yellow-400" 
                          />
                        ))}
                      </div>

                      {/* Content */}
                      <p className="text-card-foreground leading-relaxed text-sm min-h-[100px]">
                        "{t(testimonial.contentKey as any)}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3 pt-4 border-t border-border">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                          {name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-card-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t(testimonial.roleKey as any)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-8 bg-blue-600' 
                      : 'w-2 bg-border hover:bg-muted-foreground'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
