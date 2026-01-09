'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthHeader } from '@/components/auth/auth-header';
import { PasswordInput } from '@/components/auth/password-input';
import { FormError } from '@/components/auth/form-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';

function LinkAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!provider || !email) {
      router.push('/login');
    }
  }, [provider, email, router]);

  const getProviderName = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      case 'facebook':
        return 'Facebook';
      default:
        return provider;
    }
  };

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First verify the password
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid password. Please try again.');
        setLoading(false);
        return;
      }

      // Link OAuth account
      await apiClient.post('/auth/oauth/link', {
        provider,
        email,
      });

      toast.success(`Account linked with ${getProviderName(provider!)} successfully!`);
      
      // Sign in with OAuth provider
      await signIn(provider!, {
        callbackUrl: '/hub',
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to link account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Link Your Account"
        subtitle={`Link your ${getProviderName(provider!)} account`}
      />

      <div className="mt-8 space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <LinkIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Account Already Exists</p>
              <p className="mt-1">
                An account with email <strong>{email}</strong> already exists. 
                Enter your password to link it with your {getProviderName(provider!)} account.
              </p>
            </div>
          </div>
        </div>

        {error && <FormError message={error} />}

        <form onSubmit={handleLinkAccount} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email || ''}
              disabled
              className="mt-1 bg-gray-50"
            />
          </div>

          <PasswordInput
            id="password"
            name="password"
            label="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking account...
              </>
            ) : (
              `Link with ${getProviderName(provider!)}`
            )}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <Button
            variant="outline"
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Cancel and return to login
          </Button>
          <p className="text-xs text-gray-500">
            Don't remember your password?{' '}
            <a href="/forgot-password" className="text-indigo-600 hover:text-indigo-500">
              Reset it
            </a>
          </p>
        </div>
      </div>
    </AuthCard>
  );
}

export default function LinkAccountPage() {
  return (
    <Suspense fallback={
      <AuthCard>
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </AuthCard>
    }>
      <LinkAccountContent />
    </Suspense>
  );
}
