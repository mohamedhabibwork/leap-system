/**
 * Fetches and parses Keycloak well-known OpenID Connect configuration
 * 
 * The well-known URL format is:
 * {KEYCLOAK_SERVER_URL}/realms/{REALM}/.well-known/openid-configuration
 * 
 * This endpoint returns configuration including:
 * - issuer: The realm issuer URL
 * - authorization_endpoint: OAuth2 authorization endpoint
 * - token_endpoint: OAuth2 token endpoint
 * - jwks_uri: JSON Web Key Set URI for public keys
 */

export interface WellKnownConfig {
  authServerUrl: string;
  realm: string;
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  jwksUri: string;
  userinfoEndpoint?: string;
  endSessionEndpoint?: string;
  introspectEndpoint?: string;
}

/**
 * Fetches well-known configuration from Keycloak
 * 
 * @param wellKnownUrl - The full well-known URL
 * @returns Parsed configuration object
 * @throws Error if the URL is invalid or the request fails
 */
export async function fetchWellKnownConfig(
  wellKnownUrl: string
): Promise<WellKnownConfig> {
  if (!wellKnownUrl) {
    throw new Error('Well-known URL is required');
  }

  try {
    const response = await fetch(wellKnownUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch well-known config: ${response.status} ${response.statusText}`
      );
    }

    const config = await response.json() as {
      issuer?: string;
      authorization_endpoint?: string;
      token_endpoint?: string;
      jwks_uri?: string;
      userinfo_endpoint?: string;
      end_session_endpoint?: string;
      token_introspection_endpoint?: string;
    };

    // Extract issuer: https://keycloak.habib.cloud/realms/leap-realm
    // Format: {protocol}://{host}/realms/{realm}
    const issuer = config.issuer;
    if (!issuer) {
      throw new Error('Missing issuer in well-known configuration');
    }

    const issuerMatch = issuer.match(/^(https?:\/\/[^\/]+)\/realms\/([^\/]+)/);
    
    if (!issuerMatch) {
      throw new Error(
        `Invalid issuer format in well-known config: ${issuer}. ` +
        `Expected format: {protocol}://{host}/realms/{realm}`
      );
    }

    const authServerUrl = issuerMatch[1];
    const realm = issuerMatch[2];

    return {
      authServerUrl,
      realm,
      issuer,
      authorizationEndpoint: config.authorization_endpoint || '',
      tokenEndpoint: config.token_endpoint || '',
      jwksUri: config.jwks_uri || '',
      userinfoEndpoint: config.userinfo_endpoint,
      endSessionEndpoint: config.end_session_endpoint,
      introspectEndpoint: config.token_introspection_endpoint,
    };
  } catch (error: any) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Network error fetching well-known config from ${wellKnownUrl}: ${error.message}`
      );
    }
    throw error;
  }
}
