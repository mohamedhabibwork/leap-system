'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthHeader } from '@/components/auth/auth-header';
import { TOTPInput } from '@/components/auth/totp-input';
import { FormError } from '@/components/auth/form-error';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import apiClient from '@/lib/api/client';

function Verify2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push('/login');
    }
  }, [userId, router]);

  const handleVerify = async () => {
    if (totpCode.length !== 6 && totpCode.length !== 8) {
      setError('Please enter a valid code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/2fa/verify', {
        userId: parseInt(userId!, 10),
        code: totpCode,
        isBackupCode: useBackupCode,
      });

      // Complete sign in
      router.push('/hub');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid code. Please try again.');
      setTotpCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Two-Factor Authentication"
        subtitle="Enter your authentication code"
      />

      <div className="mt-8 space-y-6">
        {error && <FormError message={error} />}

        <div>
          <p className="text-sm text-gray-600 mb-4 text-center">
            {useBackupCode
              ? 'Enter an 8-digit backup code'
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
          <TOTPInput
            length={useBackupCode ? 8 : 6}
            value={totpCode}
            onChange={setTotpCode}
            disabled={loading}
            error={!!error}
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={loading || (useBackupCode ? totpCode.length !== 8 : totpCode.length !== 6)}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setTotpCode('');
              setError('');
            }}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {useBackupCode ? 'Use authenticator code' : 'Use backup code instead'}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to login
          </button>
        </div>
      </div>
    </AuthCard>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={
      <AuthCard>
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </AuthCard>
    }>
      <Verify2FAContent />
    </Suspense>
  );
}
