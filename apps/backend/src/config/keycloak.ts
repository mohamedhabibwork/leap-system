import { fetchWellKnownConfig, WellKnownConfig } from './keycloak-well-known';

// Cache for well-known config to avoid fetching multiple times
let wellKnownConfigCache: WellKnownConfig | null = null;
let wellKnownConfigPromise: Promise<WellKnownConfig | null> | null = null;

/**
 * Fetches Keycloak configuration from well-known URL if provided,
 * otherwise falls back to environment variables
 */
async function getKeycloakConfig(): Promise<{
  authServerUrl: string;
  realm: string;
  issuer?: string;
  wellKnownUrl?: string;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userinfoEndpoint?: string;
  introspectEndpoint?: string;
  logoutEndpoint?: string;
  jwksUri?: string;
  publicKey: string;
  clientId: string;
  clientSecret: string;
  admin: {
    url: string;
    realm: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
  };
  sync: {
    enabled: boolean;
    onCreate: boolean;
    onUpdate: boolean;
  };
  sso: {
    enabled: boolean;
    cookieDomain?: string;
    cookieSecure: boolean;
    cookieSameSite: 'strict' | 'lax' | 'none';
    sessionCookieName: string;
    allowedRedirectUrls: string[];
  };
  session: {
    maxAge: number;
    maxAgeRememberMe: number;
    maxConcurrentSessions: number;
    tokenRefreshThreshold: number;
    tokenRefreshInterval: number;
    sessionCleanupInterval: number;
  };
  urls: {
    backend: string;
    frontend: string;
  };
}> {
  // Get well-known URL from env or generate it from KEYCLOAK_SERVER_URL and KEYCLOAK_REALM
  let wellKnownUrl = process.env.KEYCLOAK_WELL_KNOWN_URL;
  
  // If well-known URL is not provided, generate it from server URL and realm
  if (!wellKnownUrl) {
    const authServerUrl = process.env.KEYCLOAK_SERVER_URL || 
                          process.env.KEYCLOAK_URL || 
                          'https://keycloak.habib.cloud';
    const realm = process.env.KEYCLOAK_REALM || 'leap-realm';
    
    // Generate well-known URL: {authServerUrl}/realms/{realm}/.well-known/openid-configuration
    wellKnownUrl = `${authServerUrl}/realms/${realm}/.well-known/openid-configuration`;
  }
  
  // Always try to fetch configuration from well-known URL
  if (wellKnownUrl) {
    // Use cached config if available
    if (wellKnownConfigCache) {
      return buildConfigFromWellKnown(wellKnownConfigCache, wellKnownUrl);
    }

    // Use existing promise if one is in progress
    if (wellKnownConfigPromise) {
      const config = await wellKnownConfigPromise;
      if (config) {
        return buildConfigFromWellKnown(config, wellKnownUrl);
      }
    }

    // Fetch well-known config
    wellKnownConfigPromise = fetchWellKnownConfig(wellKnownUrl)
      .then((config) => {
        wellKnownConfigCache = config;
        return config;
      })
      .catch((error) => {
        console.warn(
          `Failed to fetch Keycloak well-known config from ${wellKnownUrl}: ${error.message}. ` +
          `Falling back to manual environment variables.`
        );
        return null;
      });

    const config = await wellKnownConfigPromise;
    if (config) {
      return buildConfigFromWellKnown(config, wellKnownUrl);
    }
    
    // If well-known fetch failed, fall back to environment variables
    // (Warning already logged in catch block above)
  }

  // Fallback to manual environment variables
  return buildConfigFromEnv();
}

/**
 * Builds configuration from well-known config
 */
function buildConfigFromWellKnown(
  wellKnownConfig: WellKnownConfig,
  wellKnownUrl: string
) {
  return {
    authServerUrl: wellKnownConfig.authServerUrl,
    realm: wellKnownConfig.realm,
    issuer: wellKnownConfig.issuer,
    wellKnownUrl,
    authorizationEndpoint: wellKnownConfig.authorizationEndpoint,
    tokenEndpoint: wellKnownConfig.tokenEndpoint,
    userinfoEndpoint: wellKnownConfig.userinfoEndpoint,
    introspectEndpoint: wellKnownConfig.introspectEndpoint,
    logoutEndpoint: wellKnownConfig.endSessionEndpoint,
    jwksUri: wellKnownConfig.jwksUri,
    publicKey: process.env.KEYCLOAK_PUBLIC_KEY || '',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'leap-client',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
    admin: {
      url: process.env.KEYCLOAK_ADMIN_URL || wellKnownConfig.authServerUrl,
      realm: process.env.KEYCLOAK_ADMIN_REALM || 'master',
      clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
      clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || '',
      username: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
      password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
    },
    sync: {
      enabled: process.env.KEYCLOAK_SYNC_ENABLED === 'true',
      onCreate: process.env.KEYCLOAK_SYNC_ON_CREATE !== 'false',
      onUpdate: process.env.KEYCLOAK_SYNC_ON_UPDATE !== 'false',
    },
    sso: {
      enabled: process.env.KEYCLOAK_SSO_ENABLED === 'true',
      cookieDomain: process.env.COOKIE_DOMAIN || undefined,
      cookieSecure: process.env.COOKIE_SECURE !== 'false',
      cookieSameSite: (process.env.COOKIE_SAME_SITE || 'lax') as 'strict' | 'lax' | 'none',
      sessionCookieName: process.env.SESSION_COOKIE_NAME || 'leap_session',
      allowedRedirectUrls: process.env.ALLOWED_REDIRECT_URLS?.split(',').map(url => url.trim()) || [
        'http://localhost:3001',
        'http://localhost:3000',
      ],
    },
    session: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800', 10),
      maxAgeRememberMe: parseInt(process.env.SESSION_MAX_AGE_REMEMBER_ME || '2592000', 10),
      maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5', 10),
      tokenRefreshThreshold: parseInt(process.env.TOKEN_REFRESH_THRESHOLD || '300', 10),
      tokenRefreshInterval: parseInt(process.env.TOKEN_REFRESH_INTERVAL || '60000', 10),
      sessionCleanupInterval: parseInt(process.env.SESSION_CLEANUP_INTERVAL || '3600000', 10),
    },
    urls: {
      backend: process.env.BACKEND_URL || 'http://localhost:3000',
      frontend: process.env.FRONTEND_URL || 'http://localhost:3001',
    },
  };
}

/**
 * Builds configuration from environment variables
 */
function buildConfigFromEnv() {
  // Support both KEYCLOAK_URL and KEYCLOAK_SERVER_URL (aliases)
  const authServerUrl = process.env.KEYCLOAK_SERVER_URL || 
                        process.env.KEYCLOAK_URL || 
                        'https://keycloak.habib.cloud';
  const realm = process.env.KEYCLOAK_REALM || 'leap-realm';
  
  // Construct endpoints manually if well-known URL is not available
  const baseRealmUrl = `${authServerUrl}/realms/${realm}`;
  
  return {
    authServerUrl,
    realm,
    issuer: process.env.KEYCLOAK_ISSUER || `${baseRealmUrl}`,
    wellKnownUrl: process.env.KEYCLOAK_WELL_KNOWN_URL,
    authorizationEndpoint: process.env.KEYCLOAK_AUTHORIZATION_ENDPOINT || `${baseRealmUrl}/protocol/openid-connect/auth`,
    tokenEndpoint: process.env.KEYCLOAK_TOKEN_ENDPOINT || `${baseRealmUrl}/protocol/openid-connect/token`,
    userinfoEndpoint: process.env.KEYCLOAK_USERINFO_ENDPOINT || `${baseRealmUrl}/protocol/openid-connect/userinfo`,
    introspectEndpoint: process.env.KEYCLOAK_INTROSPECT_ENDPOINT || `${baseRealmUrl}/protocol/openid-connect/token/introspect`,
    logoutEndpoint: process.env.KEYCLOAK_LOGOUT_ENDPOINT || `${baseRealmUrl}/protocol/openid-connect/logout`,
    jwksUri: process.env.KEYCLOAK_JWKS_URI || `${baseRealmUrl}/protocol/openid-connect/certs`,
    publicKey: process.env.KEYCLOAK_PUBLIC_KEY || '',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'leap-client',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'rxB1oiOlkEw1v6MWNBWvPvqJfoBot8Yj',
    admin: {
      url: process.env.KEYCLOAK_ADMIN_URL || authServerUrl,
      realm: process.env.KEYCLOAK_ADMIN_REALM || 'master',
      clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
      clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || 'Uu2X10TY6rHnGFwenN6vb7aP3fSOrvMV',
      username: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin@habib.cloud',
      password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'P@ssword123',
    },
    sync: {
      enabled: process.env.KEYCLOAK_SYNC_ENABLED === 'true',
      onCreate: process.env.KEYCLOAK_SYNC_ON_CREATE !== 'false',
      onUpdate: process.env.KEYCLOAK_SYNC_ON_UPDATE !== 'false',
    },
    sso: {
      enabled: process.env.KEYCLOAK_SSO_ENABLED === 'true',
      cookieDomain: process.env.COOKIE_DOMAIN || undefined,
      cookieSecure: process.env.COOKIE_SECURE !== 'false',
      cookieSameSite: (process.env.COOKIE_SAME_SITE || 'lax') as 'strict' | 'lax' | 'none',
      sessionCookieName: process.env.SESSION_COOKIE_NAME || 'leap_session',
      allowedRedirectUrls: process.env.ALLOWED_REDIRECT_URLS?.split(',').map(url => url.trim()) || [
        'http://localhost:3001',
        'http://localhost:3000',
      ],
    },
    session: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800', 10),
      maxAgeRememberMe: parseInt(process.env.SESSION_MAX_AGE_REMEMBER_ME || '2592000', 10),
      maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5', 10),
      tokenRefreshThreshold: parseInt(process.env.TOKEN_REFRESH_THRESHOLD || '300', 10),
      tokenRefreshInterval: parseInt(process.env.TOKEN_REFRESH_INTERVAL || '60000', 10),
      sessionCleanupInterval: parseInt(process.env.SESSION_CLEANUP_INTERVAL || '3600000', 10),
    },
    urls: {
      backend: process.env.BACKEND_URL || 'http://localhost:3000',
      frontend: process.env.FRONTEND_URL || 'http://localhost:3001',
    },
  };
}

// Export async function that resolves to the config
// This allows the config to be fetched asynchronously if well-known URL is provided
let configPromise: Promise<ReturnType<typeof buildConfigFromEnv>> | null = null;

async function getConfig(): Promise<ReturnType<typeof buildConfigFromEnv>> {
  if (configPromise) {
    return configPromise;
  }
  configPromise = getKeycloakConfig().then(config => config as ReturnType<typeof buildConfigFromEnv>);
  return await configPromise;
}

// For backward compatibility, export a synchronous default export
// that uses environment variables only (for immediate access)
// The async version should be used when well-known URL is needed
const defaultConfig = buildConfigFromEnv();

export default defaultConfig;

// Export async function for getting config with well-known URL support
export { getConfig };