import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import KeycloakProvider from 'next-auth/providers/keycloak';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import type { NextAuthOptions } from 'next-auth';
import axios from 'axios';
import serverAPIClient from '@/lib/api/server-client';
import { env } from '@/lib/config/env';

async function refreshAccessToken(token: any) {
  try {
    // Skip refresh for non-Keycloak tokens
    if (!token.refreshToken || token.provider === 'credentials') {
      return token;
    }

    if (!env.keycloak.issuer || !env.keycloak.clientIdWeb || !env.keycloak.clientSecretWeb) {
      return {
        ...token,
        error: 'RefreshAccessTokenError',
      };
    }

    const url = `${env.keycloak.issuer}/protocol/openid-connect/token`;
    
    const response = await axios.post(url, new URLSearchParams({
      client_id: env.keycloak.clientIdWeb,
      client_secret: env.keycloak.clientSecretWeb,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const refreshedTokens = response.data;

    if (response.status !== 200) {
      throw refreshedTokens;
    }

    // Verify new token with backend (optional, for extra security)
    try {
      await serverAPIClient.post(
        '/auth/verify-token',
        {},
        refreshedTokens.access_token
      );
    } catch (verifyError) {
      // Don't fail refresh if backend verification fails
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Keycloak Provider
    // 
    // TROUBLESHOOTING "unauthorized_client" ERROR:
    // This error means Keycloak rejected the client credentials during token exchange.
    // Common causes and solutions:
    // 
    // 1. CLIENT SECRET MISMATCH
    //    - Verify KEYCLOAK_CLIENT_SECRET_WEB matches the secret in Keycloak admin console
    //    - In Keycloak: Clients > leap-client > Credentials > Copy the "Client secret"
    //
    // 2. CLIENT TYPE MISMATCH  
    //    - If client is "public" in Keycloak: Remove KEYCLOAK_CLIENT_SECRET_WEB and use PKCE
    //    - If client is "confidential": Ensure KEYCLOAK_CLIENT_SECRET_WEB is set correctly
    //    - In Keycloak: Clients > leap-client > Settings > Access Type should be "confidential"
    //
    // 3. CLIENT AUTHENTICATION SETTING
    //    - In Keycloak: Clients > leap-client > Settings > "Client authentication" must be "On"
    //
    // 4. REDIRECT URI MISMATCH
    //    - In Keycloak: Clients > leap-client > Settings > Valid Redirect URIs
    //    - Must include: http://localhost:3001/api/auth/callback/keycloak
    //
    // 5. WEB ORIGINS
    //    - In Keycloak: Clients > leap-client > Settings > Web Origins
    //    - Should include: http://localhost:3001
    //
    ...(env.keycloak.issuer && env.keycloak.clientIdWeb && env.keycloak.clientSecretWeb
      ? [
          KeycloakProvider({
            clientId: env.keycloak.clientIdWeb,
            clientSecret: env.keycloak.clientSecretWeb,
            issuer: env.keycloak.issuer,
            authorization: {
              params: {
                scope: 'openid email profile',
              },
            },
            // For confidential clients, use state only (not PKCE)
            // If your client is public, remove KEYCLOAK_CLIENT_SECRET_WEB and change to: checks: ['pkce', 'state']
            checks: ['state'],
            wellKnown: `${env.keycloak.issuer}/.well-known/openid-configuration`,
          } as any), // Type assertion needed due to NextAuth type definitions
        ]
      : []),

    // Google OAuth Provider
    ...(env.oauth.google
      ? [
          GoogleProvider({
            clientId: env.oauth.google.clientId,
            clientSecret: env.oauth.google.clientSecret,
          }),
        ]
      : []),

    // GitHub OAuth Provider
    ...(env.oauth.github
      ? [
          GitHubProvider({
            clientId: env.oauth.github.clientId,
            clientSecret: env.oauth.github.clientSecret,
          }),
        ]
      : []),

    // Facebook OAuth Provider
    ...(env.oauth.facebook
      ? [
          FacebookProvider({
            clientId: env.oauth.facebook.clientId,
            clientSecret: env.oauth.facebook.clientSecret,
          }),
        ]
      : []),

    // Credentials Provider (fallback for DB authentication)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Call backend API to validate credentials (note: backend has /api prefix)
          // Include credentials to ensure cookies are sent/received
          try {
            const data = await serverAPIClient.post<{
              user: {
                id: number;
                email: string;
                username: string;
                firstName: string;
                lastName: string;
                avatarUrl?: string;
                roleId: number;
                roles: unknown;
                permissions: unknown;
                twoFactorEnabled: boolean;
              };
              access_token: string;
              refresh_token: string;
              expires_in: number;
              sessionToken?: string;
            }>(
              '/auth/login',
              {
                email: credentials.email,
                password: credentials.password,
                rememberMe: credentials.rememberMe === 'true',
              },
              undefined,
              {
                withCredentials: true, // Include cookies in request and response
              }
            );

            if (data && data.user) {
              return {
                id: data.user.id,
                email: data.user.email,
                username: data.user.username,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                name: `${data.user.firstName} ${data.user.lastName}`,
                image: data.user.avatarUrl,
                roleId: data.user.roleId,
                roles: data.user.roles,
                permissions: data.user.permissions,
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
                sessionToken: data.sessionToken, // Store session token for reference
                twoFactorEnabled: data.user.twoFactorEnabled,
              } as any; // NextAuth allows custom properties on User
            }
            
            return null;
          } catch (error: any) {
            return null;
          }
        } catch (error: any) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: env.sessionMaxAge,
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-email',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user has 2FA enabled
      if (account?.provider === 'credentials' && (user as any).twoFactorEnabled) {
        // Redirect to 2FA verification page
        // Store user data in session storage for 2FA verification
        return `/auth/verify-2fa?userId=${user.id}`;
      }
      
      // Handle OAuth errors
      if (account?.provider === 'keycloak' && account.error) {
        // Don't allow sign in if there's an OAuth error
        return false;
      }
      
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // Handle OAuth errors in JWT callback
      if (account?.error) {
        // Return error in token so it can be handled in session callback
        return {
          ...token,
          error: account.error,
          errorDescription: account.error_description,
        };
      }
      
      // Initial sign in
      if (account && user) {
        const userWithExtras = user as any;
        return {
          provider: account.provider,
          accessToken: userWithExtras.accessToken || account.access_token,
          accessTokenExpires: userWithExtras.expiresIn
            ? Date.now() + userWithExtras.expiresIn * 1000
            : Date.now() + (account.expires_at ? account.expires_at * 1000 : 3600000),
          refreshToken: userWithExtras.refreshToken || account.refresh_token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name || `${userWithExtras.firstName || ''} ${userWithExtras.lastName || ''}`.trim(),
            image: user.image || userWithExtras.avatarUrl,
            firstName: userWithExtras.firstName,
            lastName: userWithExtras.lastName,
            username: userWithExtras.username,
            roleId: userWithExtras.roleId,
            roles: userWithExtras.roles,
            permissions: userWithExtras.permissions,
          },
        };
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      // Handle OAuth errors in session
      if (token.error) {
        // Token refresh failed or OAuth error occurred
        session.error = token.error as string;
      }

      // Ensure accessToken is always set from token - check multiple locations
      const accessToken = 
        (token.accessToken as string) ||
        (token as any)?.accessToken ||
        (token as any)?.access_token ||
        null;
        
      if (accessToken) {
        session.accessToken = accessToken;
      }
      
      session.user = token.user as any;
      
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Revoke session in backend and clear session cookie
      try {
        // Call logout endpoint which handles session revocation and cookie clearing
        await serverAPIClient.post(
          '/auth/logout',
          {},
          token?.accessToken as string | undefined,
          {
            withCredentials: true, // Include cookies
          }
        );
      } catch (error) {
        // Silently handle logout errors
      }
    },
  },
  debug: env.isDevelopment,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
