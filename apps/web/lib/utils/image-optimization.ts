/**
 * Image Optimization Utilities
 * Helpers for optimizing images in Next.js
 */

export const IMAGE_CONFIGS = {
  // Avatar sizes
  avatar: {
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 96, height: 96 },
    xlarge: { width: 128, height: 128 },
  },
  
  // Card images
  card: {
    thumbnail: { width: 400, height: 225 },
    small: { width: 200, height: 150 },
    medium: { width: 600, height: 400 },
    large: { width: 1200, height: 675 },
  },
  
  // Banner images
  banner: {
    small: { width: 728, height: 90 },
    medium: { width: 970, height: 250 },
    large: { width: 1920, height: 400 },
  },
};

/**
 * Generate blur data URL for placeholder
 */
export function getBlurDataURL(width = 10, height = 10): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#e5e7eb"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Get optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(
  src: string | undefined,
  type: 'avatar' | 'card' | 'banner' = 'card',
  size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium'
) {
  if (!src) {
    return null;
  }

  const dimensions = IMAGE_CONFIGS[type][size];
  
  return {
    src,
    ...dimensions,
    quality: 85,
    loading: 'lazy' as const,
    placeholder: 'blur' as const,
    blurDataURL: getBlurDataURL(),
  };
}

/**
 * Get responsive image sizes for srcset
 */
export function getResponsiveSizes(type: 'avatar' | 'card' | 'banner' = 'card'): string {
  switch (type) {
    case 'avatar':
      return '(max-width: 768px) 32px, 48px';
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'banner':
      return '100vw';
    default:
      return '100vw';
  }
}

/**
 * Check if image URL is external
 */
export function isExternalImage(src: string): boolean {
  return src.startsWith('http://') || src.startsWith('https://');
}
