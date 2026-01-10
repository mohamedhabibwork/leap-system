'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { X } from 'lucide-react';
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

interface AdModalProps {
  ad: Ad;
  placement: string;
  onClose: () => void;
  autoCloseDelay?: number; // Seconds before showing close button
  language?: 'en' | 'ar';
}

export function AdModal({ ad, placement, onClose, autoCloseDelay = 5, language = 'en' }: AdModalProps) {
  const [countdown, setCountdown] = useState(autoCloseDelay);
  const [canClose, setCanClose] = useState(autoCloseDelay === 0);

  const title = language === 'ar' && ad.titleAr ? ad.titleAr : ad.titleEn;
  const description = language === 'ar' && ad.descriptionAr ? ad.descriptionAr : ad.descriptionEn;

  useEffect(() => {
    // Track impression immediately
    trackAdImpression(ad.id, placement);

    // Countdown timer
    if (autoCloseDelay > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanClose(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [ad.id, placement, autoCloseDelay]);

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

  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-w-2xl w-full rounded-lg bg-white dark:bg-gray-800 shadow-xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={!canClose}
          className={`absolute top-4 right-4 z-10 rounded-full bg-gray-900/70 p-2 text-white transition-opacity ${
            canClose ? 'hover:bg-gray-900 cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
          aria-label={canClose ? 'Close' : `Close in ${countdown}s`}
        >
          {canClose ? (
            <X className="h-5 w-5" />
          ) : (
            <span className="text-sm font-medium">{countdown}s</span>
          )}
        </button>

        {/* Sponsored Badge */}
        <div className="absolute top-4 left-4 z-10 rounded bg-gray-900/70 px-3 py-1 text-sm font-medium text-white">
          Sponsored
        </div>

        <Link
          href={destinationUrl}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          className="block"
        >
          {ad.mediaUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
              <Image
                src={ad.mediaUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}

          <div className="p-6">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>

            {description && (
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                {description}
              </p>
            )}

            {ad.callToAction && (
              <button className="w-full rounded bg-primary px-6 py-3 text-lg font-medium text-white hover:bg-primary/90">
                {ad.callToAction}
              </button>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
