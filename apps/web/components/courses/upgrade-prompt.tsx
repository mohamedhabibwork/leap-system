'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnrollmentExpiryBadge } from './enrollment-expiry-badge';
import { Lock, TrendingUp, Zap } from 'lucide-react';

interface UpgradePromptProps {
  lockedLessonsCount: number;
  courseId: number;
  courseName: string;
  coursePrice?: number;
  enrollment?: {
    expiresAt?: Date;
    enrollmentType: string;
    daysRemaining?: number;
  };
  onEnrollClick: () => void;
}

export function UpgradePrompt({
  lockedLessonsCount,
  courseId,
  courseName,
  coursePrice,
  enrollment,
  onEnrollClick,
}: UpgradePromptProps) {
  // If user is enrolled and has time remaining, show renewal reminder
  if (enrollment && enrollment.daysRemaining !== undefined && enrollment.daysRemaining <= 30) {
    return (
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900">
                Your Access is Expiring Soon
              </h3>
            </div>
            <p className="text-sm text-yellow-800 mb-3">
              Your enrollment in {courseName} will expire soon. Renew now to maintain uninterrupted access.
            </p>
            {enrollment.expiresAt && (
              <EnrollmentExpiryBadge
                expiresAt={enrollment.expiresAt}
                enrollmentType={enrollment.enrollmentType}
              />
            )}
          </div>
          <Button variant="default" onClick={onEnrollClick}>
            Renew Now
          </Button>
        </div>
      </Card>
    );
  }

  // If user is not enrolled, show upgrade prompt
  if (lockedLessonsCount > 0) {
    return (
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                Unlock {lockedLessonsCount} Premium Lesson{lockedLessonsCount !== 1 ? 's' : ''}
              </h3>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Get full access to all course content, resources, and instructor support.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {coursePrice === 0 ? 'Free Course' : `$${coursePrice}`}
                </span>
              </div>
            </div>
          </div>
          <Button variant="default" onClick={onEnrollClick} className="whitespace-nowrap">
            {coursePrice === 0 ? 'Enroll Free' : 'Enroll Now'}
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}
