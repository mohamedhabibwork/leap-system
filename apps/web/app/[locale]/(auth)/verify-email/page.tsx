'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import apiClient from '@/lib/api/client';

type VerificationState = 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<VerificationState>('verifying');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setState('error');
      toast.error('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        await apiClient.post('/auth/verify-email', { token });
        setState('success');
        toast.success('Email verified successfully!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/hub');
        }, 3000);
      } catch (error: any) {
        setState('error');
        toast.error(error.response?.data?.message || 'Verification failed');
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleResend = async () => {
    setResending(true);
    try {
      await apiClient.post('/auth/send-verification');
      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  if (state === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20">
        <div className="text-center bg-card p-8 rounded-2xl shadow-xl max-w-md">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <h2 className="mt-6 text-2xl font-bold text-card-foreground">
            Verifying your email...
          </h2>
          <p className="mt-2 text-muted-foreground">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-xl text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-card-foreground">Email verified!</h2>
            <p className="mt-4 text-muted-foreground">
              Your email has been successfully verified. Welcome to LEAP PM!
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Redirecting you to your dashboard...
            </p>
          </div>
          <Link href="/hub">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-xl text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
            <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-card-foreground">Verification failed</h2>
          <p className="mt-4 text-muted-foreground">
            This verification link is invalid or has expired.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            You can request a new verification email below.
          </p>
        </div>
        <div className="space-y-3">
          <Button onClick={handleResend} className="w-full" disabled={resending}>
            {resending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend verification email
              </>
            )}
          </Button>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20">
        <div className="text-center bg-card p-8 rounded-2xl shadow-xl max-w-md">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <h2 className="mt-6 text-2xl font-bold text-card-foreground">Loading...</h2>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
