'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreateEnrollment } from '@/lib/hooks/use-api';
import { toast } from 'sonner';
import { Check, X, DollarSign, Clock, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: number;
    titleEn: string;
    price?: number;
    thumbnailUrl?: string;
    durationHours?: number;
  };
  lockedLessonsCount?: number;
}

export function EnrollModal({
  isOpen,
  onClose,
  course,
  lockedLessonsCount = 0,
}: EnrollModalProps) {
  const router = useRouter();
  const { mutate: createEnrollment, isPending } = useCreateEnrollment();

  const handleEnroll = () => {
    createEnrollment(
      {
        courseId: course.id,
        enrollmentTypeId: 1, // TODO: Get from lookup table
        statusId: 1, // Active status
      },
      {
        onSuccess: () => {
          toast.success('Successfully enrolled in course!');
          onClose();
          router.refresh();
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to enroll in course');
        },
      }
    );
  };

  const benefits = [
    'Full access to all course lessons',
    'Downloadable resources and materials',
    'Assignment submission and feedback',
    'Certificate of completion',
    'Lifetime access to course content',
    'Instructor support and Q&A',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Enroll in Course</DialogTitle>
          <DialogDescription>
            Unlock all premium content and features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Info */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{course.titleEn}</h3>
            <div className="flex gap-4 text-sm text-muted-foreground">
              {course.durationHours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.durationHours} hours</span>
                </div>
              )}
              {lockedLessonsCount > 0 && (
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{lockedLessonsCount} premium lessons</span>
                </div>
              )}
            </div>
          </div>

          {/* What's Included */}
          <div>
            <h4 className="font-semibold mb-3">What's Included:</h4>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Course Price</p>
                <p className="text-3xl font-bold flex items-center">
                  {course.price === 0 || !course.price ? (
                    'Free'
                  ) : (
                    <>
                      <DollarSign className="h-6 w-6" />
                      {course.price}
                    </>
                  )}
                </p>
              </div>
              {course.price === 0 && (
                <Badge className="bg-green-500">100% Free</Badge>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            disabled={isPending}
            className="flex-1 sm:flex-none"
          >
            {isPending ? 'Enrolling...' : course.price === 0 ? 'Enroll Free' : 'Proceed to Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
