'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
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
import { useFormMutation } from '@/lib/hooks/use-form-mutation';
import { ValidationErrorSummary } from '@/components/forms/form-validation-error';
import { useState } from 'react';
import { AnalyticsEvents } from '@/lib/firebase/analytics';
import { extractValidationErrors } from '@/lib/utils/validation-errors';
import apiClient from '@/lib/api/client';
import { signIn } from 'next-auth/react';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required').optional().or(z.literal('')),
  lastName: z.string().min(1, 'Last name is required').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });

  const registerMutation = useFormMutation<any, any, RegisterFormData, any, RegisterFormData>({
    mutationFn: async (data) => {
      const payload = {
        email: data.email,
        password: data.password,
        ...(data.username && { username: data.username }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
      };
      
      return await apiClient.post('/auth/register', payload);
    },
    form,
    onSuccess: async (response) => {
      // Track successful registration
      try {
        AnalyticsEvents.signUp('credentials');
      } catch (analyticsError) {
        // Silently fail analytics
      }

      // Auto-login after successful registration
      try {
        const result = await signIn('credentials', {
          email: form.getValues('email'),
          password: form.getValues('password'),
          redirect: false,
        });

        if (result?.error) {
          // Registration succeeded but auto-login failed, redirect to login
          router.push('/login?registered=true');
        } else {
          // Successfully logged in, redirect to hub
          router.push('/hub');
        }
      } catch (error) {
        // Auto-login failed, redirect to login page
        router.push('/login?registered=true');
      }
    },
    onError: (error: any) => {
      // Extract validation errors if present
      const validationErrs = extractValidationErrors(error);
      if (validationErrs) {
        setValidationErrors(validationErrs);
      } else {
        // Set general error message
        let errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
        
        // In non-production, show detailed error information
        if (process.env.NODE_ENV !== 'production' && error.response?.data?.details) {
          errorMessage += ` (Details: ${error.response.data.details})`;
        }
        
        setGeneralError(errorMessage);
      }

      // Track failed registration attempt
      try {
        AnalyticsEvents.signUp('credentials_failed');
      } catch (analyticsError) {
        // Silently fail analytics
      }
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setGeneralError('');
    setValidationErrors(null);
    registerMutation.mutate(data);
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John"
                    autoComplete="given-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Doe"
                    autoComplete="family-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="johndoe"
                  autoComplete="username"
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </Form>
  );
}
