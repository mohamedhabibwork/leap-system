'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { trackAdImpression, trackAdClick } from '@/lib/ads-tracking';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Ad {
  id: number;
  uuid: string;
  adType: string;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  mediaUrl?: string;
  callToAction?: string;
  targetType?: string;
  targetId?: number;
  externalUrl?: string;
}

interface AdSponsoredContentProps {
  ad: Ad;
  placement: string;
  variant?: 'card' | 'inline';
  className?: string;
  language?: 'en' | 'ar';
}

export function AdSponsoredContent({ 
  ad, 
  placement, 
  variant = 'card',
  className = '', 
  language = 'en' 
}: AdSponsoredContentProps) {
  const [impressionTracked, setImpressionTracked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const title = language === 'ar' && ad.titleAr ? ad.titleAr : ad.titleEn;
  const description = language === 'ar' && ad.descriptionAr ? ad.descriptionAr : ad.descriptionEn;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionTracked) {
            setTimeout(() => {
              if (entry.isIntersecting) {
                trackAdImpression(ad.id, placement);
                setImpressionTracked(true);
              }
            }, 1000);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      if (contentRef.current) {
        observer.unobserve(contentRef.current);
      }
    };
  }, [ad.id, placement, impressionTracked]);

  const getDestinationUrl = () => {
    if (ad.targetType === 'external' && ad.externalUrl) {
      return ad.externalUrl;
    }
    if (ad.targetType === 'course' && ad.targetId) {
      return `/hub/courses/${ad.targetId}`;
    }
    if (ad.targetType === 'event' && ad.targetId) {
      return `/hub/events/${ad.targetId}`;
    }
    if (ad.targetType === 'job' && ad.targetId) {
      return `/hub/jobs/${ad.targetId}`;
    }
    return '#';
  };

  const destinationUrl = getDestinationUrl();
  const isExternal = ad.targetType === 'external';

  const handleClick = () => {
    trackAdClick(ad.id, placement, destinationUrl);
  };

  if (variant === 'inline') {
    return (
      <div
        ref={contentRef}
        className={`relative border-l-4 border-primary/30 bg-gray-50 p-4 dark:bg-gray-800/50 ${className}`}
      >
        {/* Sponsored Badge */}
        <div className="mb-2 text-xs font-medium text-primary">
          Sponsored Content
        </div>

        <Link
          href={destinationUrl}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          className="block"
        >
          <div className="flex gap-4">
            {ad.mediaUrl && (
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded">
                <Image
                  src={ad.mediaUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}

            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white line-clamp-2">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>

          {ad.callToAction && (
            <button className="mt-3 text-sm font-medium text-primary hover:underline">
              {ad.callToAction} →
            </button>
          )}
        </Link>
      </div>
    );
  }

  // Card variant (default) - matches post card styling
  return (
    <Card
      ref={contentRef}
      className={cn(
        'bg-background border-border rounded-lg shadow-sm',
        'hover:shadow-md transition-all duration-200',
        'overflow-hidden',
        className
      )}
    >
      {/* Sponsored Badge */}
      <div className="bg-muted/50 px-4 py-2 border-b border-border/50 flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px] font-medium">
          Sponsored
        </Badge>
      </div>

      <CardContent className="p-4">
        <Link
          href={destinationUrl}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          className="block group"
        >
          {ad.mediaUrl && (
            <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={ad.mediaUrl}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              />
            </div>
          )}

          <h3 className="mb-2 font-semibold text-[15px] text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {description && (
            <p className="mb-3 text-sm text-muted-foreground line-clamp-3">
              {description}
            </p>
          )}

          {ad.callToAction && (
            <Button
              className="w-full"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                handleClick();
                window.open(destinationUrl, isExternal ? '_blank' : '_self');
              }}
            >
              {ad.callToAction}
            </Button>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
