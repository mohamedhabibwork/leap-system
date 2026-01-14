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
  
  // Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
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
    
    // Environment
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
  };
}

export const env = getEnvConfig();
export type { EnvConfig };
