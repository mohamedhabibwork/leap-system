'use client';

import { use, useState } from 'react';
import { useLesson, useLessonAccess, useCourse } from '@/lib/hooks/use-api';
import { PageLoader } from '@/components/loading/page-loader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LessonAccessBadge } from '@/components/courses/lesson-access-badge';
import { EnrollmentExpiryBadge } from '@/components/courses/enrollment-expiry-badge';
import { ForbiddenError } from '@/components/errors/forbidden-error';
import { EnrollButton } from '@/components/buttons/enroll-button';
import { PlayCircle, FileText, Download, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

export default function LessonClient({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id: courseId, lessonId } = use(params);
  const parsedCourseId = parseInt(courseId);
  const parsedLessonId = parseInt(lessonId);

  const { data: course, isLoading: isLoadingCourse } = useCourse(parsedCourseId);
  const { data: lesson, isLoading: isLoadingLesson } = useLesson(parsedLessonId);
  const { data: accessCheck, isLoading: isLoadingAccess } = useLessonAccess(parsedLessonId);

  if (isLoadingLesson || isLoadingAccess || isLoadingCourse) {
    return <PageLoader message="Loading lesson..." />;
  }

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  // Access denied - show enrollment prompt
  if (accessCheck && !accessCheck.canAccess) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href={`/hub/courses/${courseId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Access Required</h1>
        </div>

        <Card className="p-8 text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">This Lesson is Locked</h2>
          <p className="text-muted-foreground mb-6">
            Enroll in the course to access this lesson and all premium content.
          </p>

          {/* Lesson Preview Info */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">{lesson.titleEn}</h3>
            {lesson.descriptionEn && (
              <p className="text-sm text-muted-foreground">{lesson.descriptionEn}</p>
            )}
            {lesson.durationMinutes && (
              <p className="text-xs text-muted-foreground mt-2">
                Duration: {lesson.durationMinutes} minutes
              </p>
            )}
          </div>

          {course && (
            <div className="space-y-4">
              <div className="flex justify-center items-center gap-4">
                <p className="text-2xl font-bold">
                  {(course as any).price === 0 ? 'Free' : `$${(course as any).price}`}
                </p>
              </div>
              <EnrollButton
                courseId={parsedCourseId}
                price={(course as any).price}
                enrollmentType={(course as any).price === 0 ? 'free' : 'paid'}
                isEnrolled={false}
                size="lg"
              />
              <Link href={`/hub/courses/${courseId}`}>
                <Button variant="outline" className="w-full">
                  View Course Details
                </Button>
              </Link>
            </div>
          )}

          {/* Show enrollment expiry if expired */}
          {accessCheck.enrollment?.isExpired && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-900 font-semibold">Your enrollment has expired</p>
              <p className="text-sm text-red-700 mt-1">
                Renew your enrollment to continue accessing this course
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Access granted - show lesson content
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/hub/courses/${courseId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{lesson.titleEn}</h1>
            {(course as any) && (
              <p className="text-sm text-muted-foreground">{(course as any).titleEn}</p>
            )}
          </div>
        </div>
        <LessonAccessBadge
          isPreview={lesson.isPreview}
          canAccess={accessCheck?.canAccess || false}
          accessReason={accessCheck?.reason}
        />
      </div>

      {/* Enrollment Expiry Warning */}
      {accessCheck?.enrollment && accessCheck.enrollment.expiresAt && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-yellow-900">
                Enrollment Status: {accessCheck.enrollment.enrollmentType}
              </p>
              <p className="text-sm text-yellow-700">
                Your access will expire soon
              </p>
            </div>
            <EnrollmentExpiryBadge
              expiresAt={accessCheck.enrollment.expiresAt}
              enrollmentType={accessCheck.enrollment.enrollmentType}
            />
          </div>
        </Card>
      )}

      {/* Video Player */}
      {lesson.videoUrl && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={lesson.videoUrl}
                controls
                className="w-full h-full"
                poster={(course as any)?.thumbnailUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Lesson Content</h2>
          {lesson.descriptionEn && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{lesson.descriptionEn}</p>
            </div>
          )}
          {lesson.contentEn && (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: lesson.contentEn }} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments */}
      {lesson.attachmentUrl && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Resources</h3>
            <Button variant="outline" asChild>
              <a href={lesson.attachmentUrl} download>
                <Download className="h-4 w-4 mr-2" />
                Download Attachment
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" asChild>
          <Link href={`/hub/courses/${courseId}`}>
            Back to Course
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/hub/courses/${courseId}`}>
            Next Lesson
          </Link>
        </Button>
      </div>
    </div>
  );
}
