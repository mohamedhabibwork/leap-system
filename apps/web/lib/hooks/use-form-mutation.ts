import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { AxiosError } from 'axios';
import { useValidationErrors } from './use-validation-errors';

/**
 * Options for useFormMutation hook
 */
export interface UseFormMutationOptions<
  TData = unknown,
  TError = AxiosError,
  TVariables = void,
  TContext = unknown,
  TFieldValues extends FieldValues = FieldValues
> extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'onError'> {
  /**
   * React Hook Form instance
   */
  form?: UseFormReturn<TFieldValues>;
  
  /**
   * Whether to automatically set form errors on mutation error
   * Default: true
   */
  autoSetFormErrors?: boolean;

  /**
   * Custom error handler (called after auto error handling)
   */
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void;

  /**
   * Whether to focus the first field with an error
   * Default: true
   */
  shouldFocusError?: boolean;
}

/**
 * Enhanced mutation hook that integrates with React Hook Form
 * Automatically handles validation errors and sets them on the form
 * 
 * @example
 * ```tsx
 * const form = useForm<LoginData>({
 *   resolver: zodResolver(loginSchema),
 * });
 * 
 * const loginMutation = useFormMutation({
 *   mutationFn: (data) => apiClient.post('/auth/login', data),
 *   form,
 *   onSuccess: () => {
 *     toast.success('Login successful');
 *     router.push('/dashboard');
 *   },
 * });
 * 
 * const handleSubmit = form.handleSubmit((data) => {
 *   loginMutation.mutate(data);
 * });
 * ```
 */
export function useFormMutation<
  TData = unknown,
  TError = AxiosError,
  TVariables = void,
  TContext = unknown,
  TFieldValues extends FieldValues = FieldValues
>(
  options: UseFormMutationOptions<TData, TError, TVariables, TContext, TFieldValues>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { setFormErrors } = useValidationErrors<TFieldValues>();
  
  const {
    form,
    autoSetFormErrors = true,
    shouldFocusError = true,
    onError,
    ...mutationOptions
  } = options;

  return useMutation<TData, TError, TVariables, TContext>({
    ...mutationOptions,
    onError: (error, variables, context) => {
      // Automatically set form errors if enabled and form is provided
      if (autoSetFormErrors && form) {
        setFormErrors(error, form.setError, {
          shouldFocus: shouldFocusError,
        });
      }

      // Call custom error handler if provided
      if (onError) {
        onError(error, variables, context);
      }
    },
  });
}

/**
 * Type helper for form mutation function
 */
export type FormMutationFn<TData, TVariables> = (
  variables: TVariables
) => Promise<TData>;
