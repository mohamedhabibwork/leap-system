/**
 * Utility functions for PWA feature
 */

/**
 * Check if PWA is enabled via environment variable
 * @returns true if PWA is enabled, false otherwise
 */
export function isPWAEnabled(): boolean {
  // Check environment variable - default to true if not set (backward compatibility)
  const pwaEnabled = process.env.NEXT_PUBLIC_ENABLE_PWA;
  
  // If explicitly set to 'false' or '0', disable PWA
  if (pwaEnabled === 'false' || pwaEnabled === '0') {
    return false;
  }
  
  // If explicitly set to 'true' or '1', enable PWA
  if (pwaEnabled === 'true' || pwaEnabled === '1') {
    return true;
  }
  
  // If not set, default to true for backward compatibility
  // But you can change this to false if you want PWA disabled by default
  return true;
}
