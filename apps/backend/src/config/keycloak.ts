import { fetchWellKnownConfig, WellKnownConfig } from './keycloak-well-known';
import { env, getBooleanEnv, getIntEnv, getArrayEnv } from './env';

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
  oidc: {
    enabled: boolean;
    useKeycloakConnect: boolean;
    pkce: boolean;
  };
}> {
  // Get well-known URL from env or generate it from KEYCLOAK_SERVER_URL and KEYCLOAK_REALM
  let wellKnownUrl = env.KEYCLOAK_WELL_KNOWN_URL;
  
  // If well-known URL is not provided, generate it from server URL and realm
  if (!wellKnownUrl) {
    const authServerUrl = env.KEYCLOAK_SERVER_URL || 
                          env.KEYCLOAK_URL || 
                          'https://keycloak.habib.cloud';
    const realm = env.KEYCLOAK_REALM;
    
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
    publicKey: env.KEYCLOAK_PUBLIC_KEY,
    clientId: env.KEYCLOAK_CLIENT_ID,
    clientSecret: env.KEYCLOAK_CLIENT_SECRET,
    admin: {
      url: env.KEYCLOAK_ADMIN_URL || wellKnownConfig.authServerUrl,
      realm: env.KEYCLOAK_ADMIN_REALM,
      clientId: env.KEYCLOAK_ADMIN_CLIENT_ID,
      clientSecret: env.KEYCLOAK_ADMIN_CLIENT_SECRET,
      username: env.KEYCLOAK_ADMIN_USERNAME,
      password: env.KEYCLOAK_ADMIN_PASSWORD,
    },
    sync: {
      enabled: getBooleanEnv(env.KEYCLOAK_SYNC_ENABLED),
      onCreate: getBooleanEnv(env.KEYCLOAK_SYNC_ON_CREATE, true),
      onUpdate: getBooleanEnv(env.KEYCLOAK_SYNC_ON_UPDATE, true),
    },
    sso: {
      enabled: getBooleanEnv(env.KEYCLOAK_SSO_ENABLED),
      cookieDomain: env.COOKIE_DOMAIN || undefined,
      cookieSecure: getBooleanEnv(env.COOKIE_SECURE, true),
      cookieSameSite: env.COOKIE_SAME_SITE,
      sessionCookieName: env.SESSION_COOKIE_NAME,
      allowedRedirectUrls: getArrayEnv(env.ALLOWED_REDIRECT_URLS, [
        'http://localhost:3001',
        'http://localhost:3000',
      ]),
    },
    session: {
      maxAge: getIntEnv(env.SESSION_MAX_AGE, 604800),
      maxAgeRememberMe: getIntEnv(env.SESSION_MAX_AGE_REMEMBER_ME, 2592000),
      maxConcurrentSessions: getIntEnv(env.MAX_CONCURRENT_SESSIONS, 5),
      tokenRefreshThreshold: getIntEnv(env.TOKEN_REFRESH_THRESHOLD, 300),
      tokenRefreshInterval: getIntEnv(env.TOKEN_REFRESH_INTERVAL, 60000),
      sessionCleanupInterval: getIntEnv(env.SESSION_CLEANUP_INTERVAL, 3600000),
    },
    urls: {
      backend: env.BACKEND_URL,
      frontend: env.FRONTEND_URL,
    },
    oidc: {
      enabled: getBooleanEnv(env.KEYCLOAK_OIDC_ENABLED, true),
      useKeycloakConnect: getBooleanEnv(env.KEYCLOAK_USE_KEYCLOAK_CONNECT),
      pkce: getBooleanEnv(env.KEYCLOAK_OIDC_PKCE),
    },
  };
}

/**
 * Builds configuration from environment variables
 */
function buildConfigFromEnv() {
  // Support both KEYCLOAK_URL and KEYCLOAK_SERVER_URL (aliases)
  const authServerUrl = env.KEYCLOAK_SERVER_URL || 
                        env.KEYCLOAK_URL || 
                        'https://keycloak.habib.cloud';
  const realm = env.KEYCLOAK_REALM;
  
  // Construct endpoints manually if well-known URL is not available
  const baseRealmUrl = `${authServerUrl}/realms/${realm}`;
  
  return {
    authServerUrl,
    realm,
    issuer: env.KEYCLOAK_ISSUER || `${baseRealmUrl}`,
    wellKnownUrl: env.KEYCLOAK_WELL_KNOWN_URL || `${baseRealmUrl}/.well-known/openid-configuration`,
    authorizationEndpoint: env.KEYCLOAK_AUTHORIZATION_ENDPOINT || `${baseRealmUrl}/protocol/openid-connect/auth`,
    tokenEndpoint: env.KEYCLOAK_TOKEN_ENDPOINT || `${baseRealmUrl}/protocol/openid-connect/token`,
    userinfoEndpoint: env.KEYCLOAK_USERINFO_ENDPOINT || `${baseRealmUrl}/protocol/openid-connect/userinfo`,
    introspectEndpoint: env.KEYCLOAK_INTROSPECT_ENDPOINT || `${baseRealmUrl}/protocol/openid-connect/token/introspect`,
    logoutEndpoint: env.KEYCLOAK_LOGOUT_ENDPOINT || `${baseRealmUrl}/protocol/openid-connect/logout`,
    jwksUri: env.KEYCLOAK_JWKS_URI || `${baseRealmUrl}/protocol/openid-connect/certs`,
    publicKey: env.KEYCLOAK_PUBLIC_KEY,
    clientId: env.KEYCLOAK_CLIENT_ID,
    clientSecret: env.KEYCLOAK_CLIENT_SECRET,
    admin: {
      url: env.KEYCLOAK_ADMIN_URL || authServerUrl,
      realm: env.KEYCLOAK_ADMIN_REALM,
      clientId: env.KEYCLOAK_ADMIN_CLIENT_ID,
      clientSecret: env.KEYCLOAK_ADMIN_CLIENT_SECRET,
      username: env.KEYCLOAK_ADMIN_USERNAME,
      password: env.KEYCLOAK_ADMIN_PASSWORD,
    },
    sync: {
      enabled: getBooleanEnv(env.KEYCLOAK_SYNC_ENABLED),
      onCreate: getBooleanEnv(env.KEYCLOAK_SYNC_ON_CREATE, true),
      onUpdate: getBooleanEnv(env.KEYCLOAK_SYNC_ON_UPDATE, true),
    },
    sso: {
      enabled: getBooleanEnv(env.KEYCLOAK_SSO_ENABLED),
      cookieDomain: env.COOKIE_DOMAIN || undefined,
      cookieSecure: getBooleanEnv(env.COOKIE_SECURE, true),
      cookieSameSite: env.COOKIE_SAME_SITE,
      sessionCookieName: env.SESSION_COOKIE_NAME,
      allowedRedirectUrls: getArrayEnv(env.ALLOWED_REDIRECT_URLS, [
        'http://localhost:3001',
        'http://localhost:3000',
      ]),
    },
    session: {
      maxAge: getIntEnv(env.SESSION_MAX_AGE, 604800),
      maxAgeRememberMe: getIntEnv(env.SESSION_MAX_AGE_REMEMBER_ME, 2592000),
      maxConcurrentSessions: getIntEnv(env.MAX_CONCURRENT_SESSIONS, 5),
      tokenRefreshThreshold: getIntEnv(env.TOKEN_REFRESH_THRESHOLD, 300),
      tokenRefreshInterval: getIntEnv(env.TOKEN_REFRESH_INTERVAL, 60000),
      sessionCleanupInterval: getIntEnv(env.SESSION_CLEANUP_INTERVAL, 3600000),
    },
    urls: {
      backend: env.BACKEND_URL,
      frontend: env.FRONTEND_URL,
    },
    oidc: {
      enabled: getBooleanEnv(env.KEYCLOAK_OIDC_ENABLED, true),
      useKeycloakConnect: getBooleanEnv(env.KEYCLOAK_USE_KEYCLOAK_CONNECT),
      pkce: getBooleanEnv(env.KEYCLOAK_OIDC_PKCE),
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