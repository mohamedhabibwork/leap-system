'use client';

import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { trackAdImpression, trackAdClick } from '@/lib/ads-tracking';

interface Ad {
  id: number;
  uuid: string;
  adType: string;
  titleEn: string;
  mediaUrl?: string;
  callToAction?: string;
  targetType?: string;
  targetId?: number;
  externalUrl?: string;
}

interface AdVideoPrerollProps {
  ad: Ad;
  placement: string;
  onComplete: () => void;
  skipAfter?: number; // Seconds before allowing skip
}

export function AdVideoPreroll({ ad, placement, onComplete, skipAfter = 5 }: AdVideoPrerollProps) {
  const [countdown, setCountdown] = useState(skipAfter);
  const [canSkip, setCanSkip] = useState(skipAfter === 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Track impression
    trackAdImpression(ad.id, placement);

    // Auto-play video
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Failed to autoplay video ad:', error);
      });
    }

    // Countdown for skip button
    if (skipAfter > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanSkip(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [ad.id, placement, skipAfter]);

  const handleVideoEnd = () => {
    onComplete();
  };

  const handleSkip = () => {
    if (canSkip) {
      onComplete();
    }
  };

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
    return null;
  };

  const destinationUrl = getDestinationUrl();

  const handleVideoClick = () => {
    if (destinationUrl) {
      trackAdClick(ad.id, placement, destinationUrl);
      window.open(destinationUrl, ad.targetType === 'external' ? '_blank' : '_self');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-full max-w-4xl">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          disabled={!canSkip}
          className={`absolute top-4 right-4 z-10 flex items-center gap-2 rounded bg-gray-900/70 px-4 py-2 text-white transition-opacity ${
            canSkip ? 'hover:bg-gray-900 cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {canSkip ? (
            <>
              <span>Skip Ad</span>
              <X className="h-4 w-4" />
            </>
          ) : (
            <span>Skip in {countdown}s</span>
          )}
        </button>

        {/* Sponsored Badge */}
        <div className="absolute top-4 left-4 z-10 rounded bg-gray-900/70 px-3 py-1 text-sm font-medium text-white">
          Video Ad
        </div>

        {/* Video */}
        {ad.mediaUrl && (
          <video
            ref={videoRef}
            className="w-full cursor-pointer"
            src={ad.mediaUrl}
            onEnded={handleVideoEnd}
            onClick={handleVideoClick}
            playsInline
            muted
          />
        )}

        {/* CTA Overlay (shown when video is playing) */}
        {isPlaying && ad.callToAction && destinationUrl && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <button
              onClick={handleVideoClick}
              className="w-full rounded bg-primary px-6 py-3 text-lg font-medium text-white hover:bg-primary/90 shadow-lg"
            >
              {ad.callToAction}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
