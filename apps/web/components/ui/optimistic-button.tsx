'use client';

import { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimisticButtonProps extends ButtonProps {
  onClickAsync: () => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
  showSuccessState?: boolean;
}

export function OptimisticButton({
  onClickAsync,
  children,
  successMessage,
  errorMessage,
  showSuccessState = true,
  className,
  ...props
}: OptimisticButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleClick = async () => {
    setState('loading');
    try {
      await onClickAsync();
      if (showSuccessState) {
        setState('success');
        setTimeout(() => setState('idle'), 2000);
      } else {
        setState('idle');
      }
    } catch (error) {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  return (
    <Button
      {...props}
      className={cn(className)}
      onClick={handleClick}
      disabled={state === 'loading' || props.disabled}
    >
      {state === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {state === 'success' && showSuccessState && <Check className="mr-2 h-4 w-4" />}
      {state === 'success' && showSuccessState
        ? successMessage || 'Success!'
        : state === 'error'
        ? errorMessage || 'Error'
        : children}
    </Button>
  );
}
