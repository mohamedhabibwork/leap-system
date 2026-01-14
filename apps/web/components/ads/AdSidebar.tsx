'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { trackAdImpression, trackAdClick } from '@/lib/ads-tracking';

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

interface AdSidebarProps {
  ads: Ad[];
  placement: string;
  className?: string;
  language?: 'en' | 'ar';
}

export function AdSidebar({ ads, placement, className = '', language = 'en' }: AdSidebarProps) {
  const t = useTranslations('ads');
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [trackedImpressions, setTrackedImpressions] = useState<Set<number>>(new Set());
  const sidebarRef = useRef<HTMLDivElement>(null);

  const currentAd = ads[currentAdIndex];

  // Rotate ads every 10 seconds if multiple ads
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [ads.length]);

  // Track impression for current ad
  useEffect(() => {
    if (!currentAd || trackedImpressions.has(currentAd.id)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              if (entry.isIntersecting && !trackedImpressions.has(currentAd.id)) {
                trackAdImpression(currentAd.id, placement);
                setTrackedImpressions(prev => new Set(prev).add(currentAd.id));
              }
            }, 1000);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sidebarRef.current) {
      observer.observe(sidebarRef.current);
    }

    return () => {
      if (sidebarRef.current) {
        observer.unobserve(sidebarRef.current);
      }
    };
  }, [currentAd, placement, trackedImpressions]);

  if (!currentAd) return null;

  const title = language === 'ar' && currentAd.titleAr ? currentAd.titleAr : currentAd.titleEn;
  const description = language === 'ar' && currentAd.descriptionAr ? currentAd.descriptionAr : currentAd.descriptionEn;

  const getDestinationUrl = () => {
    if (currentAd.targetType === 'external' && currentAd.externalUrl) {
      return currentAd.externalUrl;
    }
    if (currentAd.targetType === 'course' && currentAd.targetId) {
      return `/hub/courses/${currentAd.targetId}`;
    }
    if (currentAd.targetType === 'event' && currentAd.targetId) {
      return `/hub/events/${currentAd.targetId}`;
    }
    if (currentAd.targetType === 'job' && currentAd.targetId) {
      return `/hub/jobs/${currentAd.targetId}`;
    }
    return '#';
  };

  const destinationUrl = getDestinationUrl();
  const isExternal = currentAd.targetType === 'external';

  const handleClick = () => {
    trackAdClick(currentAd.id, placement, destinationUrl);
  };

  return (
    <div ref={sidebarRef} className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      {/* Sponsored Badge */}
      <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-start">
        {t('sponsored')}
      </div>

      <Link
        href={destinationUrl}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        className="block"
      >
        {currentAd.mediaUrl && (
          <div className="relative mb-3 aspect-video w-full overflow-hidden rounded">
            <Image
              src={currentAd.mediaUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="300px"
            />
          </div>
        )}

        <h3 className="mb-2 font-bold text-gray-900 dark:text-white line-clamp-2">
          {title}
        </h3>

        {description && (
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {description}
          </p>
        )}

        {currentAd.callToAction && (
          <button className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            {currentAd.callToAction}
          </button>
        )}
      </Link>

      {/* Rotation indicator */}
      {ads.length > 1 && (
        <div className="mt-3 flex justify-center gap-1">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAdIndex(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentAdIndex ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={`Show ad ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
