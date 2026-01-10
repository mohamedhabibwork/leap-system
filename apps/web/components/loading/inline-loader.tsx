import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineLoader({ message, size = 'md', className }: InlineLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  );
}

export function ButtonLoader() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}
