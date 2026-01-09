// Client-side ad tracking utilities

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

    await fetch('/api/ads/tracking/impression', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adId,
        placementCode,
        sessionId,
        metadata,
      }),
    });
  } catch (error) {
    console.error('Failed to track ad impression:', error);
  }
}

// Track ad click
export async function trackAdClick(adId: number, placementCode: string, destinationUrl?: string, metadata?: any) {
  try {
    const sessionId = getSessionId();

    await fetch('/api/ads/tracking/click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adId,
        sessionId,
        destinationUrl,
        referrer: window.location.href,
        metadata,
      }),
    });
  } catch (error) {
    console.error('Failed to track ad click:', error);
  }
}

// Batch track impressions (for multiple ads shown at once)
export async function trackBulkImpressions(impressions: Array<{ adId: number; placementCode: string }>) {
  try {
    const sessionId = getSessionId();

    await fetch('/api/ads/tracking/impressions/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        impressions: impressions.map(imp => ({
          ...imp,
          sessionId,
        })),
      }),
    });
  } catch (error) {
    console.error('Failed to track bulk impressions:', error);
  }
}
