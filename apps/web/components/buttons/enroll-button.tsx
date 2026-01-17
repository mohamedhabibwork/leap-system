'use client';

import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, CreditCard } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useEnrollCourse } from '@/lib/hooks/use-api';
import { CoursePayment } from '@/components/payments/course-payment';

interface EnrollButtonProps {
  courseId: number;
  price: number;
  currency?: string;
  enrollmentType: 'free' | 'paid';
  isEnrolled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

/**
 * EnrollButton Component
 * Allows users to enroll in courses (free or paid)
 * For paid courses, uses CoursePayment component with mock payment
 * 
 * RTL/LTR Support:
 * - Icons positioned with gap for proper spacing
 * - Arrow icon should flip in RTL: uses rtl:rotate-180
 * - Text flows correctly in both directions
 * 
 * Theme Support:
 * - Uses theme-aware button variants
 * - Icons and text adapt to both themes
 * - Loading states visible in both themes
 */
export function EnrollButton({
  courseId,
  price,
  currency = 'USD',
  enrollmentType,
  isEnrolled,
  size = 'default',
  className,
}: EnrollButtonProps) {
  const router = useRouter();
  const enrollMutation = useEnrollCourse();

  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isEnrolled) {
      // Navigate to learning interface
      router.push(`/hub/courses/${courseId}/learn`);
      return;
    }

    // Free enrollment
    try {
      await enrollMutation.mutateAsync({
        id: courseId,
        data: {},
      });
      router.push(`/hub/courses/${courseId}/learn`);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to enroll:', error);
    }
  };

  const handlePaymentSuccess = () => {
    router.push(`/hub/courses/${courseId}/learn`);
  };

  if (isEnrolled) {
    return (
      <Button 
        size={size} 
        onClick={handleEnroll}
        className={`gap-2 ${className || ''}`}
      >
        <GraduationCap className="h-4 w-4" />
        <span>Continue Learning</span>
        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </Button>
    );
  }

  const isProcessing = enrollMutation.isPending;
  const priceNumber = Number(price);
  const isPaidCourse = enrollmentType === 'paid' && !isNaN(priceNumber) && priceNumber > 0;

  // For paid courses, render CoursePayment component directly
  if (isPaidCourse) {
    return (
      <CoursePayment
        courseId={courseId}
        amount={priceNumber.toFixed(2)}
        onSuccess={handlePaymentSuccess}
        size={size}
        className={className}
      />
    );
  }

  return (
    <Button 
      size={size} 
      onClick={handleEnroll} 
      disabled={isProcessing}
      className={`gap-2 ${className || ''}`}
    >
      {isProcessing ? (
        <>
          <GraduationCap className="h-4 w-4 animate-pulse" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <GraduationCap className="h-4 w-4" />
          <span>Enroll Free</span>
        </>
      )}
    </Button>
  );
}
