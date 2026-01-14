import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Let next-intl auto-discover the config file
// It should find i18n/request.ts automatically
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations
  compress: true, // Enable gzip compression for rendered content and static files
  generateEtags: true, // Generate ETags for better caching
  
  // Production source maps (optional - disable in production for smaller builds)
  productionBrowserSourceMaps: false,
  
  // Security: Remove x-powered-by header
  poweredByHeader: false,
  
  // CORS configuration for script tags
  crossOrigin: 'anonymous',
  
  // Allow cross-origin requests from these origins in development mode
  // This prevents unauthorized requesting of internal assets/endpoints
  allowedDevOrigins: [
    "*",
    'localhost',
    '127.0.0.1',
  ],
  
  // Disable automatic dependency patching to avoid yarn/corepack issues
  // The project uses npm, not yarn
  serverExternalPackages: [],
  
  // Build configuration
  // Use standalone output for Docker deployments (optional)
  // output: 'standalone',
  
  // TypeScript configuration
  typescript: {
    // Don't ignore TypeScript errors during build
    ignoreBuildErrors: false,
  },
  
  // Logging configuration for development
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Experimental features
  experimental: {
    // Enable optimistic client cache
    optimisticClientCache: true,
    
    // Enable View Transition API support
    viewTransition: true,
    
    // Server Actions configuration
    serverActions: {
      // Maximum body size for server actions (in bytes)
      bodySizeLimit: '2mb',
      // Allowed origins for server actions
      allowedOrigins: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'].filter(Boolean)
        : ['localhost:3001', '127.0.0.1:3001'],
    },
    
    // Temporarily disable Turbopack to test next-intl compatibility
    // turbo: {
    //   // Required for next-intl compatibility with Turbopack
    // },
  },
  
  // Development optimizations
  onDemandEntries: {
    // Period (in ms) where pages are kept in memory
    maxInactiveAge: 60 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
  
  // Development indicators configuration
  devIndicators: {
    position: 'bottom-right',
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Additional image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000',
    NEXT_PUBLIC_GRPC_WEB_URL: process.env.NEXT_PUBLIC_GRPC_WEB_URL || 'http://localhost:5000',
  },

  // Enhanced security headers
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Content Security Policy
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // 'unsafe-eval' and 'unsafe-inline' may be needed for some libraries
      "style-src 'self' 'unsafe-inline'", // 'unsafe-inline' needed for Tailwind CSS
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https: ws: wss:",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ];
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: cspDirectives.join('; ')
          },
          // HSTS header (only in production)
          ...(isProduction ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }] : []),
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
