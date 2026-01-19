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
        : ['localhost:3001', '127.0.0.1:3001', 'localhost:3000', '127.0.0.1:3000'],
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
      {
        protocol: 'https',
        hostname: 'console-minio.habib.cloud',
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
    // API Configuration
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000',
    NEXT_PUBLIC_GRPC_WEB_URL: process.env.NEXT_PUBLIC_GRPC_WEB_URL || 'http://localhost:5000',
    
    // Site Configuration
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'LEAP PM',
    NEXT_PUBLIC_TWITTER_HANDLE: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@leappm',
    
    // Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCfrg-UmNhOm53jgXXxgd-eJtzh7Yi2K3s',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'leap-pm.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'leap-pm',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'leap-pm.firebasestorage.app',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1069875222728',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1069875222728:web:56bceea53f4fc2b24f2dfd',
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-MVDGM1D2K8',
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '',
    
    // Payment Processing (mock payment - no config needed)
    
    // Analytics
    NEXT_PUBLIC_ANALYTICS_ENDPOINT: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '',
    NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE: process.env.NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE || '1.0',
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-MVDGM1D2K8',
  },

  // Enhanced security headers
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Content Security Policy
    // In development, allow HTTP connections to localhost for API calls
    const connectSrc = isProduction
      ? "'self' https: ws: wss:"
      : "'self' http://localhost:* http://127.0.0.1:* https: ws: wss:";
    
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.paypal.com https://www.sandbox.paypal.com", // PayPal SDK requires external scripts
      "style-src 'self' 'unsafe-inline'", // 'unsafe-inline' needed for Tailwind CSS
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      `connect-src ${connectSrc}`,
      "frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com", // PayPal payment buttons use iframes
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      // Only upgrade insecure requests in production
      ...(isProduction ? ["upgrade-insecure-requests"] : []),
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
