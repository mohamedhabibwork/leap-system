/**
 * OIDC Configuration Defaults
 * Centralized default values for OIDC provider configuration
 */

export const OIDC_DEFAULTS = {
  // Token TTL (Time To Live) in seconds
  TTL: {
    ACCESS_TOKEN: 3600, // 1 hour
    AUTHORIZATION_CODE: 600, // 10 minutes
    ID_TOKEN: 3600, // 1 hour
    REFRESH_TOKEN: 1209600, // 14 days
    DEVICE_CODE: 600, // 10 minutes
    USER_CODE: 600, // 10 minutes
    GRANT: 1209600, // 14 days
    SESSION: 1209600, // 14 days
  },

  // Default scopes
  SCOPES: [
    'openid',
    'profile',
    'email',
    'address',
    'phone',
    'offline_access',
  ],

  // Default subject types
  SUBJECT_TYPES: ['public', 'pairwise'] as const,

  // Default response types
  RESPONSE_TYPES: [
    'code',
    'code id_token',
    'id_token',
    'id_token token',
    'code token',
    'code id_token token',
  ] as const,

  // Default grant types
  GRANT_TYPES: [
    'authorization_code',
    'implicit',
    'refresh_token',
    'client_credentials',
    'urn:ietf:params:oauth:grant-type:device_code',
  ] as const,

  // Default token endpoint authentication methods
  TOKEN_ENDPOINT_AUTH_METHODS: [
    'client_secret_basic',
    'client_secret_post',
    'client_secret_jwt',
    'private_key_jwt',
    'none',
  ] as const,

  // PKCE configuration
  PKCE: {
    METHODS: ['S256'] as const,
  },

  // Cookie configuration
  COOKIES: {
    SAME_SITE: 'lax' as const,
    HTTP_ONLY: true,
    SECURE_IN_PRODUCTION: true,
  },

  // Feature flags defaults
  FEATURES: {
    DEV_INTERACTIONS: false, // Disabled by default, enabled in development
    REGISTRATION: true,
    REGISTRATION_MANAGEMENT: true,
    INTROSPECTION: true,
    REVOCATION: true,
    USERINFO: true,
    RP_INITIATED_LOGOUT: true,
    BACKCHANNEL_LOGOUT: true,
    CLAIMS_PARAMETER: true,
    ENCRYPTION: true,
    JWT_INTROSPECTION: true,
    JWT_RESPONSE_MODES: true,
    JWT_USERINFO: true,
    REQUEST_OBJECTS: true,
    RESOURCE_INDICATORS: true,
  },

  // JWKS configuration
  JWKS: {
    ALGORITHM: 'RS256' as const,
    KEY_SIZE: 2048,
    KID: 'default',
  },
} as const;
