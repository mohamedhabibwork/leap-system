'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { newsletterAPI } from '@/lib/api/newsletter';

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the privacy policy',
  }),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
  variant?: 'default' | 'inline';
}

export function NewsletterForm({ variant = 'default' }: NewsletterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    // @ts-ignore
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    try {
      await newsletterAPI.subscribe({ email: data.email });
      toast.success('Successfully subscribed! Check your email to confirm.');
      reset();
    } catch (error) {
      const message = (error as any)?.response?.data?.message || 'Failed to subscribe. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="your.email@example.com"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Subscribe'
            )}
          </Button>
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
        <div className="flex items-start gap-2">
          <Checkbox id="acceptTerms-inline" {...register('acceptTerms')} />
          <Label htmlFor="acceptTerms-inline" className="text-xs text-muted-foreground cursor-pointer">
            I agree to receive emails and accept the{' '}
            <a href="/privacy" className="underline hover:text-foreground">
              privacy policy
            </a>
          </Label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <Checkbox id="acceptTerms" {...register('acceptTerms')} />
        <Label htmlFor="acceptTerms" className="text-sm text-muted-foreground cursor-pointer">
          I agree to receive emails and accept the{' '}
          <a href="/privacy" className="underline hover:text-foreground">
            privacy policy
          </a>
        </Label>
      </div>
      {errors.acceptTerms && (
        <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subscribing...
          </>
        ) : (
          'Subscribe to Newsletter'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </form>
  );
}
