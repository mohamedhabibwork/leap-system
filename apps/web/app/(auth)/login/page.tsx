'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthHeader } from '@/components/auth/auth-header';
import { PasswordInput } from '@/components/auth/password-input';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import { AuthDivider } from '@/components/auth/auth-divider';
import { FormError } from '@/components/auth/form-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
      // Store tokens and redirect to hub
      // In a real app, you'd want to handle this more securely
      // For now, we'll just redirect - NextAuth will handle the session
      router.push('/hub');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        rememberMe: rememberMe.toString(),
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/hub');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeycloakLogin = async () => {
    setLoading(true);
    try {
      await signIn('keycloak', { 
        callbackUrl: '/hub',
        redirect: true,
      });
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

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && <FormError message={error} />}

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="john@example.com"
              autoFocus
            />
          </div>

          <div>
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember-me"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        <AuthDivider />

        <div className="space-y-3">
          <Button
            type="button"
            onClick={handleKeycloakLogin}
            variant="outline"
            className="w-full"
          >
            Sign in with Keycloak OIDC
          </Button>
          
          <SocialLoginButtons callbackUrl="/hub" />
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Test credentials: admin@leap-lms.com / password123
        </p>
      </div>
    </AuthCard>
  );
}
