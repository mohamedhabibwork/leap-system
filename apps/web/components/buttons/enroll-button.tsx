'use client';

import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';

interface EnrollButtonProps {
  courseId: number;
  price: number;
  enrollmentType: 'free' | 'paid';
  isEnrolled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function EnrollButton({
  courseId,
  price,
  enrollmentType,
  isEnrolled,
  size = 'default',
}: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isEnrolled) {
      // Navigate to learning interface
      router.push(`/hub/courses/${courseId}/learn`);
      return;
    }

    setLoading(true);
    try {
      // API call to enroll
      if (enrollmentType === 'paid' && price > 0) {
        // Redirect to payment flow
        router.push(`/hub/courses/${courseId}/checkout`);
      } else {
        // Free enrollment
        await new Promise((resolve) => setTimeout(resolve, 500)); // Mock API call
        toast.success('Successfully enrolled in course!');
        router.push(`/hub/courses/${courseId}/learn`);
      }
    } catch (error) {
      toast.error('Failed to enroll in course');
    } finally {
      setLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <Button size={size} onClick={handleEnroll}>
        <GraduationCap className="mr-2 h-4 w-4" />
        Continue Learning
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button size={size} onClick={handleEnroll} disabled={loading}>
      {loading ? 'Processing...' : price === 0 ? 'Enroll Free' : `Enroll Now - $${price}`}
    </Button>
  );
}
