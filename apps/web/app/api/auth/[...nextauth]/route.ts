import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import type { NextAuthOptions } from 'next-auth';
import serverAPIClient from '@/lib/api/server-client';
import { env } from '@/lib/config/env';
import { OidcProvider } from '@/lib/auth/oidc-provider';

export const authOptions: NextAuthOptions = {
  providers: [
    // OIDC Provider (our own OIDC server)
    ...(env.oidc
      ? [
          OidcProvider({
            clientId: env.oidc.clientId,
            clientSecret: env.oidc.clientSecret,
          }),
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
          // Note: Login endpoint doesn't need a token (we're logging in to get one)
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
              },
              false // Don't auto-get token for login endpoint
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
              } ; // NextAuth allows custom properties on User
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
      if (account?.provider === 'credentials' && (user ).twoFactorEnabled) {
        // Redirect to 2FA verification page
        // Store user data in session storage for 2FA verification
        return `/auth/verify-2fa?userId=${user.id}`;
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
        const userWithExtras = user ;
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

      // Access token has expired
      // For OAuth providers, NextAuth will handle token refresh automatically
      // For credentials provider, tokens are managed by the backend
      return {
        ...token,
        error: 'RefreshAccessTokenError',
      };
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
        (token )?.accessToken ||
        (token )?.access_token ||
        null;
        
      if (accessToken) {
        session.accessToken = accessToken;
      }
      
      session.user = token.user ;
      
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Revoke session in backend and clear session cookie
      try {
        // Call logout endpoint which handles session revocation and cookie clearing
        // Use explicit token if available, otherwise auto-get from session
        await serverAPIClient.post(
          '/auth/logout',
          {},
          token?.accessToken as string | undefined,
          {
            withCredentials: true, // Include cookies
          },
          true // Auto-get token from session if explicit token not provided
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
