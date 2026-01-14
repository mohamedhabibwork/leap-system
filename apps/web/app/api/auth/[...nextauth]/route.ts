import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import KeycloakProvider from 'next-auth/providers/keycloak';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import type { NextAuthOptions } from 'next-auth';

async function refreshAccessToken(token: any) {
  try {
    console.log('[NextAuth] Refreshing access token for provider:', token.provider);

    // Skip refresh for non-Keycloak tokens
    if (!token.refreshToken || token.provider === 'credentials') {
      console.log('[NextAuth] Skipping refresh for credentials provider');
      return token;
    }

    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    
    console.log('[NextAuth] Calling Keycloak token endpoint:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID_WEB!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET_WEB!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error('[NextAuth] Token refresh failed:', response.status, refreshedTokens);
      throw refreshedTokens;
    }

    console.log('[NextAuth] Token refreshed successfully');

    // Verify new token with backend (optional, for extra security)
    try {
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshedTokens.access_token}`,
        },
      });

      if (!verifyResponse.ok) {
        console.warn('[NextAuth] Backend token verification failed, but continuing with Keycloak token');
      } else {
        console.log('[NextAuth] Token verified with backend');
      }
    } catch (verifyError) {
      console.warn('[NextAuth] Could not verify token with backend:', verifyError);
      // Don't fail refresh if backend verification fails
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('[NextAuth] Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Keycloak Provider
    ...(process.env.KEYCLOAK_ISSUER && process.env.KEYCLOAK_CLIENT_ID_WEB
      ? [
          KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID_WEB!,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET_WEB!,
            issuer: process.env.KEYCLOAK_ISSUER!,
          }),
        ]
      : []),

    // Google OAuth Provider
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),

    // GitHub OAuth Provider
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),

    // Facebook OAuth Provider
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
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
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
          
          if (!apiUrl) {
            console.error('NEXT_PUBLIC_API_URL is not configured');
            return null;
          }

          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          console.log('[NextAuth] Attempting to authenticate with:', apiUrl);

          // Call backend API to validate credentials (note: backend has /api prefix)
          const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              rememberMe: credentials.rememberMe === 'true',
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error(`Auth API error: ${res.status} ${res.statusText}`, errorText);
            return null;
          }

          const data = await res.json();

          if (data && data.user) {
            console.log('[NextAuth] Authentication successful for user:', data.user.email);
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
              twoFactorEnabled: data.user.twoFactorEnabled,
            };
          }
          
          return null;
        } catch (error: any) {
          console.error('Auth error:', error?.message || error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800', 10), // 7 days default
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
      if (account?.provider === 'credentials' && user.twoFactorEnabled) {
        // Redirect to 2FA verification page
        // Store user data in session storage for 2FA verification
        return `/auth/verify-2fa?userId=${user.id}`;
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (account && user) {
        console.log('[NextAuth JWT] Initial sign in for provider:', account.provider);
        return {
          provider: account.provider,
          accessToken: user.accessToken || account.access_token,
          accessTokenExpires: user.expiresIn
            ? Date.now() + user.expiresIn * 1000
            : Date.now() + (account.expires_at ? account.expires_at * 1000 : 3600000),
          refreshToken: user.refreshToken || account.refresh_token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            image: user.image || user.avatarUrl,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            roleId: user.roleId,
            roles: user.roles,
            permissions: user.permissions,
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
      if (token.error) {
        // Token refresh failed, user needs to re-authenticate
        session.error = token.error as string;
      }

      session.accessToken = token.accessToken as string;
      session.user = token.user as any;
      
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Revoke session in backend
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        await fetch(`${apiUrl}/api/v1/auth/sessions`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token.accessToken}`,
          },
        });
      } catch (error) {
        console.error('Error revoking session:', error);
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
