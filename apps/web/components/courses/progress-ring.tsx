'use client';

import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showPercentage?: boolean;
}

const sizeMap = {
  sm: { diameter: 40, strokeWidth: 3, fontSize: 'text-[10px]' },
  md: { diameter: 56, strokeWidth: 4, fontSize: 'text-xs' },
  lg: { diameter: 80, strokeWidth: 5, fontSize: 'text-sm' },
};

export function ProgressRing({ 
  progress, 
  size = 'md', 
  className,
  showPercentage = true 
}: ProgressRingProps) {
  const { diameter, strokeWidth, fontSize } = sizeMap[size];
  const radius = (diameter - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: diameter, height: diameter }}
    >
      <svg
        className="transform -rotate-90"
        width={diameter}
        height={diameter}
      >
        {/* Background circle */}
        <circle
          className="text-muted/20"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={diameter / 2}
          cy={diameter / 2}
        />
        {/* Progress circle */}
        <circle
          className="text-primary transition-all duration-300 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={diameter / 2}
          cy={diameter / 2}
        />
      </svg>
      {showPercentage && (
        <span className={cn(
          'absolute inset-0 flex items-center justify-center font-semibold',
          fontSize
        )}>
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
