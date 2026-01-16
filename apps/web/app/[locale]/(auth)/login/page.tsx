'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthHeader } from '@/components/auth/auth-header';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AnalyticsEvents } from '@/lib/firebase/analytics';
import { LoginForm } from './login-form';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for errors from Keycloak/OAuth
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const callbackUrl = searchParams.get('callbackUrl');
    
    if (errorParam) {
      let errorMessage = 'Authentication failed. Please try again.';
      
      // Provide more specific error messages
      if (errorParam === 'OAuthCallback') {
        errorMessage = 'OAuth authentication failed. Please check your Keycloak configuration or try again.';
      } else if (errorParam === 'Configuration') {
        errorMessage = 'Authentication service is not properly configured. Please contact support.';
      } else if (errorParam === 'AccessDenied') {
        errorMessage = 'Access denied. You do not have permission to access this resource.';
      } else if (errorParam === 'Verification') {
        errorMessage = 'Email verification required. Please check your email.';
      }
      
      setError(errorMessage);
      
      // Clear error from URL after displaying
      if (errorParam && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('error');
        if (callbackUrl) {
          url.searchParams.set('callbackUrl', callbackUrl);
        }
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams]);

  // Handle Keycloak SSO login (Primary method)
  const handleKeycloakLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Track Keycloak login attempt
      try {
        AnalyticsEvents.login('keycloak');
      } catch (analyticsError) {
        // Silently fail analytics
      }
      
      // Use NextAuth to sign in with Keycloak
      await signIn('keycloak', {
        callbackUrl: '/hub',
        redirect: true,
      });
    } catch (err) {
      console.error('Keycloak login error:', err);
      setError('Failed to initiate Keycloak login. Please try again.');
      setLoading(false);
    }
  };

  // Handle other OAuth providers (optional)
  const handleOAuthLogin = async (provider: string) => {
    setLoading(true);
    setError('');
    
    try {
      await signIn(provider, {
        callbackUrl: '/hub',
        redirect: true,
      });
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setError(`Failed to login with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Sign in to LEAP LMS"
        subtitle="Choose your authentication method"
        linkText="Need help?"
        linkHref="/help"
      />

      <div className="mt-8 space-y-6">
        {/* Primary Login: Keycloak SSO */}
        <Button
          type="button"
          onClick={handleKeycloakLogin}
          className="w-full h-12"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Connecting to Keycloak...
            </>
          ) : (
            <>
              <svg
                className="mr-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
              </svg>
              Sign in with Keycloak SSO
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        {/* Username/Password Login Form */}
        <LoginForm />

        {/* Alternative OAuth Options */}
        {(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
          process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ||
          process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID) && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              )}

              {process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthLogin('github')}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </Button>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Sign in with Keycloak SSO or use your username and password.</p>
          <p className="mt-1">
            Need to register? {' '}
            <Link href="/register" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

    </AuthCard>
  );
}
