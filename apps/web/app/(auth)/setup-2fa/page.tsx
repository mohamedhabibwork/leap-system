'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthHeader } from '@/components/auth/auth-header';
import { QRCodeDisplay } from '@/components/auth/qr-code-display';
import { TOTPInput } from '@/components/auth/totp-input';
import { FormError } from '@/components/auth/form-error';
import { FormSuccess } from '@/components/auth/form-success';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Copy, Check } from 'lucide-react';
import apiClient from '@/lib/api/client';

export default function Setup2FAPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpCode, setTotpCode] = useState('');
  const [step, setStep] = useState<'scan' | 'verify' | 'backup'>('scan');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      initiate2FASetup();
    }
  }, [status, router]);

  const initiate2FASetup = async () => {
    try {
      const data = await apiClient.post('/auth/2fa/setup');
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setLoading(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to initialize 2FA setup');
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (totpCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setError('');
    setVerifying(true);

    try {
      await apiClient.post('/auth/2fa/verify-setup', { code: totpCode });
      setSuccess('2FA enabled successfully!');
      setStep('backup');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid code. Please try again.');
      setTotpCode('');
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    toast.success('Backup codes copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = () => {
    toast.success('2FA setup complete!');
    router.push('/hub/settings/security');
  };

  if (loading) {
    return (
      <AuthCard>
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Setting up 2FA...</p>
        </div>
      </AuthCard>
    );
  }

  if (step === 'scan') {
    return (
      <AuthCard>
        <AuthHeader
          title="Set up Two-Factor Authentication"
          subtitle="Enhance your account security"
        />

        <div className="mt-8 space-y-6">
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">Step 1: Scan QR Code</p>
            <p>Use an authenticator app like Google Authenticator, Authy, or 1Password to scan this QR code.</p>
          </div>

          <QRCodeDisplay qrCodeUrl={qrCodeUrl} secret={secret} />

          <Button
            onClick={() => setStep('verify')}
            className="w-full"
          >
            Continue to Verification
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </AuthCard>
    );
  }

  if (step === 'verify') {
    return (
      <AuthCard>
        <AuthHeader
          title="Verify Your Code"
          subtitle="Enter the 6-digit code from your authenticator app"
        />

        <div className="mt-8 space-y-6">
          {error && <FormError message={error} />}

          <div>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Step 2: Enter the code from your authenticator app
            </p>
            <TOTPInput
              value={totpCode}
              onChange={setTotpCode}
              disabled={verifying}
              error={!!error}
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={verifying || totpCode.length !== 6}
            className="w-full"
          >
            {verifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify and Enable 2FA'
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setStep('scan')}
            className="w-full"
          >
            Back
          </Button>
        </div>
      </AuthCard>
    );
  }

  if (step === 'backup') {
    return (
      <AuthCard>
        <AuthHeader
          title="Save Your Backup Codes"
          subtitle="Keep these codes safe - you'll need them if you lose access to your authenticator"
        />

        <div className="mt-8 space-y-6">
          {success && <FormSuccess message={success} />}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-medium text-gray-700">Backup Codes</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyBackupCodes}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-white px-3 py-2 rounded border border-gray-200">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Store these codes in a safe place. Each code can only be used once.
            </p>
          </div>

          <Button
            onClick={handleComplete}
            className="w-full"
          >
            Complete Setup
          </Button>
        </div>
      </AuthCard>
    );
  }

  return null;
}
