'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthHeader } from '@/components/auth/auth-header';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import { AuthDivider } from '@/components/auth/auth-divider';
import { Button } from '@/components/ui/button';
import { AnalyticsEvents } from '@/lib/firebase/analytics';
import { LoginForm } from './login-form';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for Keycloak callback with tokens
  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');
    const keycloakError = searchParams.get('error');

    if (keycloakError) {
      setError('Keycloak authentication failed. Please try again.');
      return;
    }

    if (token && refreshToken) {
      router.push('/hub');
    }
  }, [searchParams, router]);

  const handleKeycloakLogin = () => {
    setLoading(true);
    try {
      // Track Keycloak login attempt
      try {
        AnalyticsEvents.login('keycloak');
      } catch (analyticsError) {
        // Silently fail analytics
      }
      
      // Redirect to backend OIDC flow (primary method)
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const currentUrl = window.location.origin;
      const redirectUri = `${currentUrl}/hub`;
      
      window.location.href = `${backendUrl}/api/v1/auth/keycloak/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
    } catch (err) {
      setError('Keycloak authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Sign in to LEAP PM"
        subtitle="Don't have an account?"
        linkText="Sign up"
        linkHref="/register"
      />

      <div className="mt-8 space-y-6">
        {/* Enhanced login form with validation error handling */}
        <LoginForm />

        <div className="flex items-center justify-between text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Forgot password?
          </Link>
        </div>

        <AuthDivider />

        <div className="space-y-3">
          <Button
            type="button"
            onClick={handleKeycloakLogin}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            Sign in with Keycloak SSO
          </Button>
          
          <SocialLoginButtons callbackUrl="/hub" />
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Test credentials: admin@habib.cloud / password123
        </p>
      </div>
    </AuthCard>
  );
}
