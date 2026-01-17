import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers';
import { env } from '@/lib/config/env';

/**
 * Custom OIDC Provider for NextAuth
 * Connects to our own OIDC server
 */
export interface OidcProfile {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  picture?: string;
  roles?: string[];
  permissions?: string[];
  role_id?: number;
}

export function OidcProvider(options: OAuthUserConfig<OidcProfile>): OAuthConfig<OidcProfile> {
  if (!env.oidc) {
    throw new Error('OIDC configuration is missing. Please set OIDC_CLIENT_ID in environment variables.');
  }

  const issuer = env.oidc.issuer;
  const wellKnown = env.oidc.wellKnown;

  return {
    id: 'oidc',
    name: 'LEAP OIDC',
    type: 'oauth',
    wellKnown: wellKnown,
    authorization: {
      params: {
        scope: 'openid profile email offline_access',
        response_type: 'code',
      },
    },
    idToken: true,
    checks: ['pkce', 'state'],
    client: {
      id: env.oidc.clientId,
      secret: env.oidc.clientSecret || '',
    },
    profile(profile: OidcProfile) {
      return {
        id: profile.sub,
        email: profile.email,
        name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || profile.preferred_username,
        image: profile.picture,
        // Custom fields
        firstName: profile.given_name,
        lastName: profile.family_name,
        username: profile.preferred_username,
        roles: profile.roles || [],
        permissions: profile.permissions || [],
        roleId: profile.role_id,
        emailVerified: profile.email_verified || false,
      };
    },
    ...options,
  };
}
