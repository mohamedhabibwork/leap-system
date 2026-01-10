'use client';

import { Button } from '@/components/ui/button';
import { Calendar, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRegisterForEvent } from '@/lib/hooks/use-api';
import type { RegisterEventDto } from '@/lib/api/events';

interface RegisterButtonProps {
  eventId: number;
  registrationStatus?: 'going' | 'interested' | 'maybe' | 'not-going' | null;
  size?: 'sm' | 'default' | 'lg';
}

const STATUS_OPTIONS = [
  { value: 'going' as const, label: 'Going', icon: '✓' },
  { value: 'interested' as const, label: 'Interested', icon: '⭐' },
  { value: 'maybe' as const, label: 'Maybe', icon: '?' },
  { value: 'not-going' as const, label: 'Not Going', icon: '✗' },
];

/**
 * RegisterButton Component
 * Allows users to RSVP to events with different status options
 * 
 * RTL/LTR Support:
 * - Icons positioned with me/ms (margin-inline) for bidirectional support
 * - Dropdown content aligns to button edge in both directions
 * 
 * Theme Support:
 * - Uses theme-aware color classes (bg-accent, text-foreground)
 * - Button variants adapt to both light and dark themes
 */
export function RegisterButton({
  eventId,
  registrationStatus,
  size = 'default',
}: RegisterButtonProps) {
  const registerMutation = useRegisterForEvent();

  const handleStatusChange = async (newStatus: 'going' | 'interested' | 'maybe' | 'not-going') => {
    try {
      await registerMutation.mutateAsync({
        id: eventId,
        data: { status: newStatus },
      });
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to update registration:', error);
    }
  };

  const currentOption = STATUS_OPTIONS.find((opt) => opt.value === registrationStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          variant={registrationStatus ? 'secondary' : 'default'}
          disabled={registerMutation.isPending}
          className="gap-2"
        >
          {currentOption ? (
            <>
              <Check className="h-4 w-4" />
              {currentOption.label}
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              Register
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={registrationStatus === option.value ? 'bg-accent' : ''}
          >
            <span className="me-2">{option.icon}</span>
            <span className="flex-1 text-start">{option.label}</span>
            {registrationStatus === option.value && (
              <Check className="h-4 w-4 ms-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
