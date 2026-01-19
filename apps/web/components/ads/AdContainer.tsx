'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdBanner } from './AdBanner';
import { AdSidebar } from './AdSidebar';
import { AdModal } from './AdModal';
import { AdSponsoredContent } from './AdSponsoredContent';
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

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { apiClient } = await import('@/lib/api/client');
      const response = await apiClient.get<Ad[] | { data: Ad[] }>(
        `/ads/active?placement=${placement}&limit=${limit}`
      );
      const adsData = Array.isArray(response) ? response : (response as { data: Ad[] }).data || [];
      setAds(adsData);

      // Show modal immediately if it's a popup ad
      if (type === 'modal' && adsData.length > 0) {
        setShowModal(true);
      }
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ads');
    } finally {
      setLoading(false);
    }
  }, [placement, limit, type]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        {type === 'banner' && (
          <div className="h-24 w-full rounded-lg bg-muted" />
        )}
        {type === 'sidebar' && (
          <div className="h-64 w-full rounded-lg bg-muted" />
        )}
        {type === 'sponsored' && (
          <div className="h-48 w-full rounded-lg bg-muted border border-border" />
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
