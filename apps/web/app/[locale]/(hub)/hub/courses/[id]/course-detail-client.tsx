'use client';

import { useCourse, useCourseLessons, useEnrollmentWithType } from '@/lib/hooks/use-api';
import { PageLoader } from '@/components/loading/page-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EnrollButton } from '@/components/buttons/enroll-button';
import { FavoriteButton } from '@/components/shared/favorite-button';
import { ShareButton } from '@/components/buttons/share-button';
import { Comments } from '@/components/shared/comments';
import { CourseCard } from '@/components/cards/course-card';
import { LessonAccessBadge } from '@/components/courses/lesson-access-badge';
import { LessonLockIcon } from '@/components/courses/lesson-lock-icon';
import { EnrollmentExpiryBadge } from '@/components/courses/enrollment-expiry-badge';
import { UpgradePrompt } from '@/components/courses/upgrade-prompt';
import { EnrollModal } from '@/components/courses/enroll-modal';
import { Star, Clock, Users, PlayCircle, FileText, Award } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { use, useState, useEffect } from 'react';
import { AnalyticsEvents } from '@/lib/firebase/analytics';

export default function CourseDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = parseInt(id);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  
  const { data: courseData, isLoading } = useCourse(courseId);
  const course = courseData as any;
  const { data: lessons, isLoading: isLoadingLessons } = useCourseLessons(courseId);
  const { data: enrollment } = useEnrollmentWithType(courseId);

  // Track course view when course data is loaded
  useEffect(() => {
    if (course && course.title) {
      try {
        AnalyticsEvents.viewCourse(
          courseId.toString(),
          course.title || course.titleEn
        );
      } catch (analyticsError) {
        // Silently fail analytics
      }
    }
  }, [course, courseId]);

  const handleLessonClick = (lessonId: number, lessonTitle: string) => {
    try {
      AnalyticsEvents.clickNavigation(
        `/hub/courses/${courseId}/lessons/${lessonId}`,
        'course_detail'
      );
    } catch (analyticsError) {
      // Silently fail analytics
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading course..." />;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  const lockedLessonsCount = lessons?.filter((l: any) => !l.canAccess).length || 0;

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="relative">
        {(course as any).thumbnail && (
          <Image
            src={(course as any).thumbnail}
            alt={(course as any).title}
            width={1200}
            height={400}
            className="w-full h-64 object-cover rounded-lg"
          />
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <FavoriteButton
            entityType="course"
            entityId={course.id}
            isFavorited={course.isFavorited}
          />
          <ShareButton
            entityType="course"
            entityId={course.id}
            url={`/hub/courses/${course.id}`}
            title={(course as any).title}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{(course as any).title}</h1>
            <p className="text-muted-foreground mt-2">{(course as any).description}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{course.rating}</span>
              <span className="text-muted-foreground">
                ({course.reviewCount} reviews)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{course.enrollmentCount} students</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{course.duration} hours</span>
            </div>
            <Badge>{(course as any).level}</Badge>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3">What you'll learn</h3>
                  <ul className="space-y-2">
                    {course.learningOutcomes?.map((outcome: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Award className="w-4 h-4 mt-0.5 text-primary" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {course.requirements?.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum">
              <Card>
                <CardContent className="pt-6">
                  {/* Upgrade Prompt */}
                  <div className="mb-6">
                    <UpgradePrompt
                      lockedLessonsCount={lockedLessonsCount}
                      courseId={courseId}
                      courseName={(course as any).title || (course as any).titleEn}
                      coursePrice={course.price}
                      enrollment={enrollment ? {
                        expiresAt: enrollment.expiresAt,
                        enrollmentType: enrollment.enrollmentType?.name || 'Standard',
                        daysRemaining: enrollment.daysRemaining,
                      } : undefined}
                      onEnrollClick={() => setIsEnrollModalOpen(true)}
                    />
                  </div>

                  <div className="space-y-4">
                    {isLoadingLessons ? (
                      <p className="text-center text-muted-foreground py-8">Loading lessons...</p>
                    ) : lessons && lessons.length > 0 ? (
                      lessons.map((lesson: any) => (
                        <div
                          key={lesson.id}
                          className={`border rounded-lg p-4 transition-all ${
                            lesson.canAccess
                              ? 'hover:shadow-md cursor-pointer'
                              : 'opacity-70'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <LessonLockIcon canAccess={lesson.canAccess} />
                              <div className="flex-1">
                                {lesson.canAccess ? (
                                  <Link 
                                    href={`/hub/courses/${courseId}/lessons/${lesson.id}`}
                                    onClick={() => handleLessonClick(lesson.id, lesson.titleEn)}
                                  >
                                    <h4 className="font-semibold hover:text-primary transition-colors">
                                      {lesson.titleEn}
                                    </h4>
                                  </Link>
                                ) : (
                                  <h4 className="font-semibold text-gray-600">
                                    {lesson.titleEn}
                                  </h4>
                                )}
                                {lesson.descriptionEn && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {lesson.descriptionEn}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  {lesson.videoUrl && (
                                    <span className="flex items-center gap-1">
                                      <PlayCircle className="w-3 h-3" />
                                      Video
                                    </span>
                                  )}
                                  {lesson.durationMinutes && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {lesson.durationMinutes} min
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <LessonAccessBadge
                              isPreview={lesson.isPreview}
                              canAccess={lesson.canAccess}
                              accessReason={lesson.accessReason}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No lessons available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Comments
                entityType="course"
                entityId={course.id}
                entityUserId={(course as any).instructorId}
              />
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    Resources will be available after enrollment
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={(course as any).instructor?.avatar} />
                  <AvatarFallback>
                    {(course as any).instructor?.firstName?.[0]}
                    {(course as any).instructor?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                  <p className="font-semibold">
                    {(course as any).instructor?.firstName} {(course as any).instructor?.lastName}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Price</span>
                  <span className="text-2xl font-bold">
                    {course.price === 0
                      ? 'Free'
                      : `${course.currency} ${course.price}`}
                  </span>
                </div>
              </div>

              <EnrollButton
                courseId={course.id}
                price={course.price}
                enrollmentType={course.price === 0 ? 'free' : 'paid'}
                isEnrolled={course.isEnrolled}
                size="lg"
              />
            </CardContent>
          </Card>

          {/* Related Courses */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Related Courses</h3>
            <div className="space-y-4">
              {course.relatedCourses?.slice(0, 3).map((relatedCourse: any) => (
                <CourseCard
                  key={relatedCourse.id}
                  course={relatedCourse}
                  variant="list"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      <EnrollModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        course={{
          id: courseId,
          titleEn: (course as any).title || (course as any).titleEn,
          price: course.price,
          thumbnailUrl: (course as any).thumbnail,
          durationHours: course.duration || course.durationHours,
        }}
        lockedLessonsCount={lockedLessonsCount}
      />
    </div>
  );
}
