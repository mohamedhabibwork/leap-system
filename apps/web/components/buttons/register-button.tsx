'use client';

import { Button } from '@/components/ui/button';
import { Calendar, Check } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface RegisterButtonProps {
  eventId: number;
  registrationStatus?: 'going' | 'interested' | 'maybe' | 'not-going' | null;
  size?: 'sm' | 'default' | 'lg';
}

const STATUS_OPTIONS = [
  { value: 'going', label: 'Going', icon: '✓' },
  { value: 'interested', label: 'Interested', icon: '⭐' },
  { value: 'maybe', label: 'Maybe', icon: '?' },
  { value: 'not-going', label: 'Not Going', icon: '✗' },
];

export function RegisterButton({
  eventId,
  registrationStatus,
  size = 'default',
}: RegisterButtonProps) {
  const [status, setStatus] = useState<string | null>(registrationStatus || null);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    const prevStatus = status;

    // Optimistic update
    setStatus(newStatus);

    try {
      // API call to update registration
      await new Promise((resolve) => setTimeout(resolve, 300)); // Mock API call
      const option = STATUS_OPTIONS.find((opt) => opt.value === newStatus);
      toast.success(`RSVP updated to: ${option?.label}`);
    } catch (error) {
      // Revert on error
      setStatus(prevStatus);
      toast.error('Failed to update RSVP');
    } finally {
      setLoading(false);
    }
  };

  const currentOption = STATUS_OPTIONS.find((opt) => opt.value === status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          variant={status ? 'secondary' : 'default'}
          disabled={loading}
        >
          {currentOption ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              {currentOption.label}
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Register
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={status === option.value ? 'bg-accent' : ''}
          >
            <span className="mr-2">{option.icon}</span>
            {option.label}
            {status === option.value && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
