import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import KeycloakProvider from 'next-auth/providers/keycloak';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import type { NextAuthOptions } from 'next-auth';

async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    
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
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
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

          // Call backend API to validate credentials
          const res = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              rememberMe: credentials.rememberMe === 'true',
            }),
          });

          if (!res.ok) {
            console.error(`Auth API error: ${res.status} ${res.statusText}`);
            return null;
          }

          const data = await res.json();

          if (data) {
            return {
              ...data.user,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              expiresIn: data.expires_in,
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
        return {
          accessToken: user.accessToken || account.access_token,
          accessTokenExpires: user.expiresIn
            ? Date.now() + user.expiresIn * 1000
            : Date.now() + (account.expires_at ? account.expires_at * 1000 : 3600000),
          refreshToken: user.refreshToken || account.refresh_token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name || `${user.firstName} ${user.lastName}`,
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
      if (Date.now() < (token.accessTokenExpires as number)) {
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
        await fetch(`${apiUrl}/auth/sessions`, {
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
