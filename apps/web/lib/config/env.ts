/**
 * Centralized environment configuration
 * All environment variables should be accessed through this module
 */

interface EnvConfig {
  // API URLs
  apiUrl: string;
  graphqlUrl: string;
  wsUrl: string;
  grpcWebUrl: string;
  
  // Site config
  siteUrl: string;
  siteName: string;
  twitterHandle: string;
  googleSiteVerification?: string;
  
  // Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
  
  // NextAuth
  nextAuthUrl: string;
  nextAuthSecret: string;
  sessionMaxAge: number;
  
  // OAuth Providers
  oauth: {
    google?: {
      clientId: string;
      clientSecret: string;
    };
    github?: {
      clientId: string;
      clientSecret: string;
    };
    facebook?: {
      clientId: string;
      clientSecret: string;
    };
  };
  
  // Public OAuth Client IDs (for frontend)
  publicOAuth: {
    googleClientId?: string;
    githubClientId?: string;
    facebookClientId?: string;
  };
  
  // Firebase
  firebase?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
    vapidKey: string;
  };
  
  // PayPal
  paypal?: {
    mode: 'sandbox' | 'live';
  };
  
  // Analytics
  analytics?: {
    endpoint?: string;
    gaMeasurementId?: string;
  };
}

function getEnvConfig(): EnvConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  return {
    // API URLs
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000',
    grpcWebUrl: process.env.NEXT_PUBLIC_GRPC_WEB_URL || 'http://localhost:8081',
    
    // Site config
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'LEAP PM',
    twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@leappm',
    googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    
    // Environment
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    
    // NextAuth
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3001',
    nextAuthSecret: process.env.NEXTAUTH_SECRET || '',
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '604800', 10),
    
    // OAuth Providers
    oauth: {
      google: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }
        : undefined,
      github: process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
        ? {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }
        : undefined,
      facebook: process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
        ? {
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }
        : undefined,
    },
    
    // Public OAuth Client IDs (for frontend)
    publicOAuth: {
      googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      githubClientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      facebookClientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
    },
    
    // Firebase
    firebase: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      ? {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
          measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '',
        }
      : undefined,
    
    // PayPal
    paypal: process.env.NEXT_PUBLIC_PAYPAL_MODE
      ? {
          mode: (process.env.NEXT_PUBLIC_PAYPAL_MODE || 'sandbox') as 'sandbox' | 'live',
        }
      : undefined,
    
    // Analytics
    analytics: {
      endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
      gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    },
  };
}

export const env = getEnvConfig();
export type { EnvConfig };
