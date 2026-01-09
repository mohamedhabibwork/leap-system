'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

interface AdBannerProps {
  ad: Ad;
  placement: string;
  width?: number;
  height?: number;
  className?: string;
  language?: 'en' | 'ar';
}

export function AdBanner({ ad, placement, width = 728, height = 90, className = '', language = 'en' }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [impressionTracked, setImpressionTracked] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const title = language === 'ar' && ad.titleAr ? ad.titleAr : ad.titleEn;
  const description = language === 'ar' && ad.descriptionAr ? ad.descriptionAr : ad.descriptionEn;

  // Get destination URL
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

  // Intersection Observer to track impressions
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionTracked) {
            setIsVisible(true);
            // Track impression after 1 second of visibility
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

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => {
      if (bannerRef.current) {
        observer.unobserve(bannerRef.current);
      }
    };
  }, [ad.id, placement, impressionTracked]);

  const handleClick = () => {
    trackAdClick(ad.id, placement, destinationUrl);
  };

  return (
    <div
      ref={bannerRef}
      className={`relative overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Sponsored Badge */}
      <div className="absolute top-2 right-2 z-10 rounded bg-gray-900/70 px-2 py-1 text-xs font-medium text-white">
        Sponsored
      </div>

      <Link
        href={destinationUrl}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        className="block h-full w-full"
      >
        {ad.mediaUrl ? (
          <div className="relative h-full w-full">
            <Image
              src={ad.mediaUrl}
              alt={title}
              fill
              className="object-cover"
              sizes={`${width}px`}
            />
            {/* Overlay with text */}
            {(title || description || ad.callToAction) && (
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-4">
                {title && <h3 className="text-lg font-bold text-white mb-1">{title}</h3>}
                {description && <p className="text-sm text-gray-200 line-clamp-1">{description}</p>}
                {ad.callToAction && (
                  <button className="mt-2 w-fit rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                    {ad.callToAction}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>}
            {description && <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{description}</p>}
            {ad.callToAction && (
              <button className="mt-4 rounded bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90">
                {ad.callToAction}
              </button>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}
