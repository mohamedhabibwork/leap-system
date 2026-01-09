'use client';

import { useEffect, useState } from 'react';
import { AdBanner } from './AdBanner';
import { AdSidebar } from './AdSidebar';
import { AdModal } from './AdModal';
import { AdSponsoredContent } from './AdSponsoredContent';

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

interface AdContainerProps {
  placement: string;
  type?: 'banner' | 'sidebar' | 'modal' | 'sponsored';
  limit?: number;
  width?: number;
  height?: number;
  className?: string;
  language?: 'en' | 'ar';
}

export function AdContainer({ 
  placement, 
  type = 'banner',
  limit = 3,
  width,
  height,
  className = '',
  language = 'en'
}: AdContainerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
  }, [placement, limit]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ads/active?placement=${placement}&limit=${limit}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ads');
      }

      const data = await response.json();
      setAds(data.data || data || []);

      // Show modal immediately if it's a popup ad
      if (type === 'modal' && data.data?.length > 0) {
        setShowModal(true);
      }
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {type === 'banner' && (
          <div className="h-24 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        )}
        {type === 'sidebar' && (
          <div className="h-64 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        )}
        {type === 'sponsored' && (
          <div className="h-48 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        )}
      </div>
    );
  }

  if (error || !ads.length) {
    return null; // Don't show anything if there's an error or no ads
  }

  if (type === 'banner') {
    return (
      <AdBanner
        ad={ads[0]}
        placement={placement}
        width={width}
        height={height}
        className={className}
        language={language}
      />
    );
  }

  if (type === 'sidebar') {
    return (
      <AdSidebar
        ads={ads}
        placement={placement}
        className={className}
        language={language}
      />
    );
  }

  if (type === 'modal') {
    return showModal ? (
      <AdModal
        ad={ads[0]}
        placement={placement}
        onClose={() => setShowModal(false)}
        language={language}
      />
    ) : null;
  }

  if (type === 'sponsored') {
    return (
      <AdSponsoredContent
        ad={ads[0]}
        placement={placement}
        className={className}
        language={language}
      />
    );
  }

  return null;
}
