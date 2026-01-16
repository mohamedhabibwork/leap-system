'use client';

import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { LookupTypeCode } from '@leap-lms/shared-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale } from 'next-intl';

interface LookupSelectProps {
  typeCode: LookupTypeCode | string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable lookup select component
 * Automatically fetches and displays lookups by type code
 * Supports localization (AR/EN)
 */
export function LookupSelect({
  typeCode,
  value,
  onValueChange,
  placeholder = 'Select...',
  disabled = false,
  className,
}: LookupSelectProps) {
  const locale = useLocale() as 'en' | 'ar';
  const { data: lookups, isLoading, isError } = useLookupsByType(typeCode);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (isError || !lookups) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Error loading options" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {lookups.map((lookup) => {
          const label = locale === 'ar' && lookup.nameAr ? lookup.nameAr : lookup.nameEn;
          return (
            <SelectItem key={lookup.code} value={lookup.code}>
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
