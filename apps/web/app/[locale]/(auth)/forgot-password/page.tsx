'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthHeader } from '@/components/auth/auth-header';
import { FormError } from '@/components/auth/form-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import apiClient from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthCard>
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <Mail className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-card-foreground">Check your email</h2>
            <p className="mt-4 text-muted-foreground">
              We've sent a password reset link to <strong className="text-card-foreground">{email}</strong>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setSubmitted(false)}
                className="text-primary hover:text-primary/80 font-medium"
              >
                try again
              </button>
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Forgot your password?"
        subtitle="No worries! Enter your email and we'll send you a reset link."
      />

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && <FormError message={error} />}

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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
