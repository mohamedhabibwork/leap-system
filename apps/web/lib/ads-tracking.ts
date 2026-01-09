// Client-side ad tracking utilities
import { apiClient } from '@/lib/api/client';

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('ad_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('ad_session_id', sessionId);
  }
  return sessionId;
}

// Track ad impression
export async function trackAdImpression(adId: number, placementCode: string, metadata?: any) {
  try {
    const sessionId = getSessionId();

    await apiClient.post('/ads/tracking/impression', {
      adId,
      placementCode,
      sessionId,
      metadata,
    });
  } catch (error) {
    console.error('Failed to track ad impression:', error);
  }
}

// Track ad click
export async function trackAdClick(adId: number, placementCode: string, destinationUrl?: string, metadata?: any) {
  try {
    const sessionId = getSessionId();

    await apiClient.post('/ads/tracking/click', {
      adId,
      sessionId,
      destinationUrl,
      referrer: typeof window !== 'undefined' ? window.location.href : '',
      metadata,
    });
  } catch (error) {
    console.error('Failed to track ad click:', error);
  }
}

// Batch track impressions (for multiple ads shown at once)
export async function trackBulkImpressions(impressions: Array<{ adId: number; placementCode: string }>) {
  try {
    const sessionId = getSessionId();

    await apiClient.post('/ads/tracking/impressions/bulk', {
      impressions: impressions.map(imp => ({
        ...imp,
        sessionId,
      })),
    });
  } catch (error) {
    console.error('Failed to track bulk impressions:', error);
  }
}
