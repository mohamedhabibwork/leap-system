'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { signIn } from 'next-auth/react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/auth/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormMutation } from '@/lib/hooks/use-form-mutation';
import { ValidationErrorSummary } from '@/components/forms/form-validation-error';
import { useState } from 'react';
import { AnalyticsEvents } from '@/lib/firebase/analytics';
import { extractValidationErrors } from '@/lib/utils/validation-errors';

// Validation schema
const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) ,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const loginMutation = useFormMutation<any, any, LoginFormData, any, LoginFormData>({
    mutationFn: async (data) => {
      // Use NextAuth signIn for credentials
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe?.toString() || 'false',
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    form,
    onSuccess: () => {
      // Track successful login
      try {
        AnalyticsEvents.login('credentials');
      } catch (analyticsError) {
        // Silently fail analytics
      }
      router.push('/hub');
    },
    onError: (error: any) => {
      // Extract validation errors if present
      const validationErrs = extractValidationErrors(error);
      if (validationErrs) {
        setValidationErrors(validationErrs);
      } else {
        // Set general error message
        let errorMessage = error.response?.data?.message || error.message || 'Invalid email or password';
        
        // In non-production, show detailed error information
        if (process.env.NODE_ENV !== 'production' && error.response?.data?.details) {
          errorMessage += ` (Details: ${error.response.data.details})`;
        }
        
        setGeneralError(errorMessage);
      }

      // Track failed login attempt
      try {
        AnalyticsEvents.login('credentials_failed');
      } catch (analyticsError) {
        // Silently fail analytics
      }
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setGeneralError('');
    setValidationErrors(null);
    loginMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Validation error summary */}
        {validationErrors && (
          <ValidationErrorSummary errors={validationErrors} />
        )}

        {/* General error message */}
        {generalError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {generalError}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  autoComplete="email"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <PasswordInput
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal cursor-pointer">
                Remember me
              </FormLabel>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </Form>
  );
}
