'use client';

import { useCourse, useCourseLessons, useEnrollmentWithType, useCourseReviews } from '@/lib/hooks/use-api';
import { useCourseResources } from '@/lib/hooks/use-resources-api';
import { ResourceList } from '@/components/resources/resource-list';
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
import { SkillsList } from '@/components/courses/skills-badge';
import { Star, Clock, Users, PlayCircle, FileText, Award, ChevronRight, CheckCircle2, Video, Download, Trophy, Globe, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { use, useState, useEffect } from 'react';
import { AnalyticsEvents } from '@/lib/firebase/analytics';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function CourseDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('courses');
  const router = useRouter();
  const { id } = use(params);
  const courseId = parseInt(id);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  
  const { data: courseData, isLoading } = useCourse(courseId);
  const course = courseData as any;
  const { data: lessons, isLoading: isLoadingLessons } = useCourseLessons(courseId);
  const { data: enrollment } = useEnrollmentWithType(courseId);
  const { data: resources, isLoading: isLoadingResources } = useCourseResources(courseId, !!enrollment);
  const { data: reviews } = useCourseReviews(courseId);

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

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <PageLoader message="Loading course..." />;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  const isEnrolled = !!enrollment;
  const lockedLessonsCount = lessons?.filter((l: any) => !l.canAccess).length || 0;
  
  // Group lessons by section for curriculum display
  const lessonsBySection = lessons?.reduce((acc: any, lesson: any) => {
    const sectionId = lesson.sectionId || 0;
    if (!acc[sectionId]) {
      acc[sectionId] = {
        id: sectionId,
        title: lesson.sectionTitle || 'Course Content',
        lessons: []
      };
    }
    acc[sectionId].lessons.push(lesson);
    return acc;
  }, {}) || {};

  const sections = Object.values(lessonsBySection);

  // Calculate average rating
  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
    : course.rating || 4.8;

  // If not enrolled, show Udemy-style landing page
  if (!isEnrolled) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Left Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-400">
                  <Link href="/hub/courses" className="hover:text-white transition-colors">
                    {t('list.title')}
                  </Link>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  <span className="text-slate-300">{course.category || 'Category'}</span>
                </nav>
                
                {/* Title & Description */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    {course.title || course.titleEn}
                  </h1>
                  <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
                    {course.description || course.descriptionEn}
                  </p>
                </div>
                
                {/* Course Stats */}
                <div className="flex flex-wrap gap-6 items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg">{avgRating.toFixed(1)}</span>
                    <span className="text-slate-400">
                      ({reviews?.length || course.reviewCount || 0} {t('details.reviews')})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border-s border-slate-700 ps-6 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-6">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{(course.enrollmentCount || 0).toLocaleString()} {t('card.studentsCount', { count: course.enrollmentCount || 0 })}</span>
                  </div>
                  <div className="flex items-center gap-2 border-s border-slate-700 ps-6 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-6">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{course.duration || course.durationHours} {t('card.hoursCount', { count: course.duration || course.durationHours })}</span>
                  </div>
                  <div className="flex items-center gap-2 border-s border-slate-700 ps-6 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-6">
                    <Badge variant="outline" className="text-white border-slate-600">
                      {course.level || 'Beginner'}
                    </Badge>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border-2 border-slate-600">
                    <AvatarImage src={course.instructor?.avatar} />
                    <AvatarFallback className="bg-slate-700 text-white text-lg">
                      {course.instructor?.firstName?.[0] || course.instructor?.name?.[0]}
                      {course.instructor?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                      {t('details.instructor')}
                    </p>
                    <p className="font-bold text-white text-lg">
                      {course.instructor?.firstName} {course.instructor?.lastName} {course.instructor?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right - Video Preview Card */}
              <div className="lg:col-span-1">
                <Card className="overflow-hidden shadow-2xl border-none sticky top-4 bg-white dark:bg-slate-800">
                  <div className="relative aspect-video group cursor-pointer bg-black">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title || course.titleEn}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <Video className="w-20 h-20 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-center space-y-2">
                        <PlayCircle className="w-20 h-20 text-white mx-auto" />
                        <p className="text-white text-sm font-medium">Preview this course</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-foreground">
                        {course.price === 0 || !course.price ? t('details.free') : `${course.currency || '$'}${course.price}`}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        {course?.id && (
                          <EnrollButton
                            courseId={course.id}
                            price={course.price}
                            enrollmentType={course.price === 0 ? 'free' : 'paid'}
                            isEnrolled={false}
                            size="lg"
                          />
                        )}
                      </div>
                      <div className="h-14 w-14 shrink-0">
                        <FavoriteButton
                          entityType="course"
                          entityId={course.id}
                          isFavorited={course.isFavorited}
                          size="lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t">
                      <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                        {t('details.thisCourseIncludes', { defaultValue: 'This course includes:' })}
                      </p>
                      <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Video className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{course.duration || course.durationHours} {t('card.hoursCount', { count: course.duration || course.durationHours })}</p>
                            <p className="text-xs text-muted-foreground">
                              {t('details.onDemandVideo', { defaultValue: 'On-demand video' })}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">
                              {lessons?.length || 0} {t('card.lessonsCount', { count: lessons?.length || 0 })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('details.lessons', { defaultValue: 'Lessons' })}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Download className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">
                              {t('details.downloadableResources', { defaultValue: 'Downloadable resources' })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('details.articlesAndFiles', { defaultValue: 'Articles and files' })}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">
                              {t('details.certificateOfCompletion', { defaultValue: 'Certificate of completion' })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('details.shareable', { defaultValue: 'Shareable on LinkedIn' })}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Globe className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">
                              {t('details.lifetimeAccess', { defaultValue: 'Lifetime access' })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('details.mobileAndDesktop', { defaultValue: 'On mobile and desktop' })}
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="w-full">
                      <ShareButton
                        entityType="course"
                        entityId={course.id}
                        url={`/hub/courses/${course.id}`}
                        title={course.title || course.titleEn}
                        size="lg"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <Tabs defaultValue="overview" className="bg-background rounded-xl shadow-lg border overflow-hidden">
                <TabsList className="w-full justify-start border-b rounded-none bg-muted/30 h-16 px-6 gap-8 overflow-x-auto no-scrollbar">
                  <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent shadow-none px-0 h-full font-semibold">{t('details.overview')}</TabsTrigger>
                  <TabsTrigger value="curriculum" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent shadow-none px-0 h-full font-semibold">{t('details.curriculum')}</TabsTrigger>
                  <TabsTrigger value="instructor" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent shadow-none px-0 h-full font-semibold">{t('details.instructor')}</TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent shadow-none px-0 h-full font-semibold">{t('details.reviews')}</TabsTrigger>
                </TabsList>

                <div className="p-8">
                  <TabsContent value="overview" className="mt-0 space-y-10">
                    {/* Skills You'll Gain Section */}
                    {course.skills && course.skills.length > 0 && (
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <Trophy className="w-6 h-6 text-primary" />
                          <h3 className="text-2xl font-bold">
                            {t('details.skillsYouWillGain', { defaultValue: "Skills you'll gain" })}
                          </h3>
                        </div>
                        <SkillsList skills={course.skills || []} />
                      </section>
                    )}

                    {/* What You'll Learn */}
                    <section>
                      <h3 className="text-2xl font-bold mb-6">{t('details.whatYouWillLearn')}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {course.learningOutcomes?.map((outcome: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-accent/30 border border-accent">
                            <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600 dark:text-green-500 shrink-0" />
                            <span className="leading-relaxed font-medium">{outcome}</span>
                          </div>
                        ))}
                        {(!course.learningOutcomes || course.learningOutcomes.length === 0) && (
                          <p className="text-muted-foreground italic col-span-2">No outcomes specified</p>
                        )}
                      </div>
                    </section>

                    {/* Requirements */}
                    <section>
                      <h3 className="text-2xl font-bold mb-6">{t('details.requirements')}</h3>
                      {course.requirements && course.requirements.length > 0 ? (
                        <ul className="space-y-3">
                          {course.requirements.map((req: string, index: number) => (
                            <li key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors">
                              <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground italic">No requirements specified</p>
                      )}
                    </section>

                    {/* Course Content Summary */}
                    <section>
                      <h3 className="text-2xl font-bold mb-4">{t('details.courseContent')}</h3>
                      <div className="flex items-center gap-8 text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          <span className="font-semibold text-foreground">
                            {lessons?.length || 0}
                          </span>{' '}
                          {t('card.lessonsCount', { count: lessons?.length || 0 })}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          <span className="font-semibold text-foreground">
                            {course.duration || course.durationHours}
                          </span>{' '}
                          {t('card.hoursCount', { count: course.duration || course.durationHours })}
                        </span>
                        <span className="flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          <span className="font-semibold text-foreground">English</span>
                        </span>
                      </div>
                    </section>
                  </TabsContent>

                  <TabsContent value="curriculum" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold">{t('details.curriculum')}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {lessons?.length || 0} {t('card.lessonsCount', { count: lessons?.length || 0 })}
                          </p>
                        </div>
                      </div>

                      {isLoadingLessons ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
                        </div>
                      ) : sections.length > 0 ? (
                        <div className="space-y-2">
                          {sections.map((section: any) => (
                            <Collapsible
                              key={section.id}
                              open={expandedSections.has(section.id)}
                              onOpenChange={() => toggleSection(section.id)}
                            >
                              <CollapsibleTrigger className="w-full">
                                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    {expandedSections.has(section.id) ? (
                                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    )}
                                    <div className="text-start">
                                      <h4 className="font-bold text-lg">{section.title}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {section.lessons.length} {t('card.lessonsCount', { count: section.lessons.length })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="border-t border-x rounded-b-lg divide-y">
                                  {section.lessons.map((lesson: any) => (
                                    <div
                                      key={lesson.id}
                                      className="p-4 bg-muted/30 flex items-center justify-between gap-4"
                                    >
                                      <div className="flex items-center gap-4 flex-1">
                                        <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-muted-foreground">
                                            {lesson.titleEn || lesson.title}
                                          </h5>
                                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            {lesson.videoUrl && (
                                              <span className="flex items-center gap-1.5">
                                                <PlayCircle className="w-4 h-4" />
                                                Video
                                              </span>
                                            )}
                                            {lesson.durationMinutes && (
                                              <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {lesson.durationMinutes} min
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <Badge variant="secondary" className="shrink-0">
                                        <Lock className="w-3 h-3 me-1" />
                                        Locked
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                          <p className="text-muted-foreground">{t('details.noLessons')}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="instructor" className="mt-0">
                    <Card className="p-8 border-2">
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-xl">
                          <AvatarImage src={course.instructor?.avatar} />
                          <AvatarFallback className="text-4xl font-bold bg-primary/10">
                            {course.instructor?.firstName?.[0] || course.instructor?.name?.[0]}
                            {course.instructor?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-5">
                          <div>
                            <h3 className="text-3xl font-bold mb-2">
                              {course.instructor?.firstName} {course.instructor?.lastName} {course.instructor?.name}
                            </h3>
                            <p className="text-primary font-semibold text-lg">
                              {t('details.expertInstructor', { defaultValue: 'Expert Instructor' })}
                            </p>
                          </div>
                          <p className="text-muted-foreground leading-relaxed text-lg">
                            {course.instructor?.bio || "Experienced professional sharing knowledge with learners worldwide."}
                          </p>
                          <div className="flex flex-wrap gap-8 pt-4">
                            <div className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-lg">4.8</span>
                              <span className="text-muted-foreground">
                                {t('details.instructorRating', { defaultValue: 'Instructor Rating' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-primary" />
                              <span className="font-bold text-lg">15,000+</span>
                              <span className="text-muted-foreground">
                                {t('details.students', { defaultValue: 'Students' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-primary" />
                              <span className="font-bold text-lg">12</span>
                              <span className="text-muted-foreground">
                                {t('details.courses', { defaultValue: 'Courses' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-0">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">{t('details.ratingsAndReviews')}</h3>
                        <div className="flex items-center gap-2">
                          <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                          <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({reviews?.length || 0} {t('details.reviews')})
                          </span>
                        </div>
                      </div>
                      <Comments
                        entityType="course"
                        entityId={course.id}
                        entityUserId={course.instructorId}
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>

        <EnrollModal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          course={{
            id: courseId,
            titleEn: course.title || course.titleEn,
            price: course.price,
            thumbnailUrl: course.thumbnail,
            durationHours: course.duration || course.durationHours,
          }}
          lockedLessonsCount={lockedLessonsCount}
        />
      </div>
    );
  }

  // If enrolled, show the learning interface (existing code)
  return (
    <div className="flex flex-col min-h-screen">
      {/* LinkedIn-Style Dark Hero Section with Video Preview */}
      <div className="bg-[#1d2226] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-400">
                <Link href="/hub/courses" className="hover:text-white transition-colors">
                  {t('list.title')}
                </Link>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                <span className="text-gray-200">{course.category || 'Category'}</span>
              </nav>
              
              {/* Title & Description */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  {course.title || course.titleEn}
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
                  {course.description || course.descriptionEn}
                </p>
              </div>
              
              {/* Course Stats */}
              <div className="flex flex-wrap gap-6 items-center text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg">{course.rating || '4.8'}</span>
                  <span className="text-gray-400">
                    ({(course.reviewCount || 0).toLocaleString()} {t('details.reviews')})
                  </span>
                </div>
                <div className="flex items-center gap-2 border-s border-gray-700 ps-6 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-6">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{(course.enrollmentCount || 0).toLocaleString()} {t('card.studentsCount', { count: course.enrollmentCount || 0 })}</span>
                </div>
                <div className="flex items-center gap-2 border-s border-gray-700 ps-6 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-6">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{course.duration} {t('card.hoursCount', { count: course.duration })}</span>
                </div>
                <div className="flex items-center gap-2 border-s border-gray-700 ps-6 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-6">
                  <Badge variant="outline" className="text-white border-gray-600">
                    {course.level || 'Beginner'}
                  </Badge>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border-2 border-gray-600">
                  <AvatarImage src={course.instructor?.avatar} />
                  <AvatarFallback className="bg-gray-700 text-white text-lg">
                    {course.instructor?.firstName?.[0]}
                    {course.instructor?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    {t('details.instructor')}
                  </p>
                  <p className="font-bold text-white text-lg">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Video Preview Card */}
            <div className="lg:col-span-1">
              <Card className="overflow-hidden shadow-2xl border-none sticky top-4">
                <div className="relative aspect-video group cursor-pointer bg-black">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title || course.titleEn}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <Video className="w-20 h-20 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center space-y-2">
                      <PlayCircle className="w-20 h-20 text-white mx-auto" />
                      <p className="text-white text-sm font-medium">Preview this course</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20 w-full">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="overview" className="bg-background rounded-xl shadow-lg border overflow-hidden">
              <TabsList className="w-full justify-start border-b rounded-none bg-muted/30 h-16 px-6 gap-8 overflow-x-auto no-scrollbar">
                <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent shadow-none px-0 h-full font-semibold">{t('details.overview')}</TabsTrigger>
                <TabsTrigger value="curriculum" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent shadow-none px-0 h-full font-semibold">{t('details.curriculum')}</TabsTrigger>
                <TabsTrigger value="instructor" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent shadow-none px-0 h-full font-semibold">{t('details.instructor')}</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent shadow-none px-0 h-full font-semibold">{t('details.reviews')}</TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent shadow-none px-0 h-full font-semibold">{t('details.resources')}</TabsTrigger>
              </TabsList>

              <div className="p-8">
                <TabsContent value="overview" className="mt-0 space-y-10">
                  {/* Skills You'll Gain Section */}
                  {course.skills && course.skills.length > 0 && (
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <Trophy className="w-6 h-6 text-primary" />
                        <h3 className="text-2xl font-bold">
                          {t('details.skillsYouWillGain', { defaultValue: "Skills you'll gain" })}
                        </h3>
                      </div>
                      <SkillsList skills={course.skills || []} />
                    </section>
                  )}

                  {/* What You'll Learn */}
                  <section>
                    <h3 className="text-2xl font-bold mb-6">{t('details.whatYouWillLearn')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.learningOutcomes?.map((outcome: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-accent/30 border border-accent">
                          <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600 dark:text-green-500 shrink-0" />
                          <span className="leading-relaxed font-medium">{outcome}</span>
                        </div>
                      ))}
                      {(!course.learningOutcomes || course.learningOutcomes.length === 0) && (
                        <p className="text-muted-foreground italic col-span-2">No outcomes specified</p>
                      )}
                    </div>
                  </section>

                  {/* Requirements */}
                  <section>
                    <h3 className="text-2xl font-bold mb-6">{t('details.requirements')}</h3>
                    {course.requirements && course.requirements.length > 0 ? (
                      <ul className="space-y-3">
                        {course.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground italic">No requirements specified</p>
                    )}
                  </section>

                  {/* Course Content Summary */}
                  <section>
                    <h3 className="text-2xl font-bold mb-4">{t('details.courseContent')}</h3>
                    <div className="flex items-center gap-8 text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        <span className="font-semibold text-foreground">
                          {lessons?.length || 0}
                        </span>{' '}
                        {t('card.lessonsCount', { count: lessons?.length || 0 })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold text-foreground">
                          {course.duration}
                        </span>{' '}
                        {t('card.hoursCount', { count: course.duration })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        <span className="font-semibold text-foreground">English</span>
                      </span>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="curriculum" className="mt-0">
                  <div className="space-y-6">
                    <UpgradePrompt
                      lockedLessonsCount={lockedLessonsCount}
                      courseId={courseId}
                      courseName={course.title || course.titleEn}
                      coursePrice={course.price}
                      enrollment={enrollment ? {
                        expiresAt: enrollment.expiresAt,
                        enrollmentType: enrollment.enrollmentType?.name || 'Standard',
                        daysRemaining: enrollment.daysRemaining,
                      } : undefined}
                      onEnrollClick={() => setIsEnrollModalOpen(true)}
                    />

                    <div className="space-y-3">
                      {isLoadingLessons ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
                        </div>
                      ) : lessons && lessons.length > 0 ? (
                        lessons.map((lesson: any) => (
                          <div
                            key={lesson.id}
                            className={`group border rounded-xl p-5 transition-all duration-200 ${
                              lesson.canAccess
                                ? 'hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                                : 'bg-muted/30 opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="shrink-0">
                                  <LessonLockIcon canAccess={lesson.canAccess} />
                                </div>
                                <div className="flex-1">
                                  {lesson.canAccess ? (
                                    <Link 
                                      href={`/hub/courses/${courseId}/lessons/${lesson.id}`}
                                      onClick={() => handleLessonClick(lesson.id, lesson.titleEn)}
                                    >
                                      <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                                        {lesson.titleEn}
                                      </h4>
                                    </Link>
                                  ) : (
                                    <h4 className="font-bold text-lg text-gray-500">
                                      {lesson.titleEn}
                                    </h4>
                                  )}
                                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                    {lesson.videoUrl && (
                                      <span className="flex items-center gap-1.5">
                                        <PlayCircle className="w-4 h-4" />
                                        Video
                                      </span>
                                    )}
                                    {lesson.durationMinutes && (
                                      <span className="flex items-center gap-1.5 border-s ps-4 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-4">
                                        <Clock className="w-4 h-4" />
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
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                          <p className="text-muted-foreground">{t('details.noLessons')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="instructor" className="mt-0">
                  <Card className="p-8 border-2">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-xl">
                        <AvatarImage src={course.instructor?.avatar} />
                        <AvatarFallback className="text-4xl font-bold bg-primary/10">
                          {course.instructor?.firstName?.[0]}
                          {course.instructor?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-5">
                        <div>
                          <h3 className="text-3xl font-bold mb-2">
                            {course.instructor?.firstName} {course.instructor?.lastName}
                          </h3>
                          <p className="text-primary font-semibold text-lg">
                            {t('details.expertInstructor', { defaultValue: 'Expert Instructor' })}
                          </p>
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                          {course.instructor?.bio || "Experienced professional sharing knowledge with learners worldwide."}
                        </p>
                        <div className="flex flex-wrap gap-8 pt-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-lg">4.8</span>
                            <span className="text-muted-foreground">
                              {t('details.instructorRating', { defaultValue: 'Instructor Rating' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            <span className="font-bold text-lg">15,000+</span>
                            <span className="text-muted-foreground">
                              {t('details.students', { defaultValue: 'Students' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-primary" />
                            <span className="font-bold text-lg">12</span>
                            <span className="text-muted-foreground">
                              {t('details.courses', { defaultValue: 'Courses' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="mt-0">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">{t('details.ratingsAndReviews')}</h3>
                    <Comments
                      entityType="course"
                      entityId={course.id}
                      entityUserId={course.instructorId}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-0">
                  {enrollment ? (
                    <div className="space-y-4">
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => router.push(`/hub/courses/${courseId}/learn`)}
                      >
                        {t('details.continueLearning', { defaultValue: 'Continue Learning' })}
                      </Button>
                      {enrollment.progressPercentage > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('details.progress', { defaultValue: 'Progress' })}</span>
                            <span className="font-medium">{enrollment.progressPercentage.toFixed(0)}%</span>
                          </div>
                          <Progress value={enrollment.progressPercentage} className="h-2" />
                        </div>
                      )}
                      {enrollment.progressPercentage === 100 && (
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full"
                          onClick={() => router.push(`/hub/courses/${courseId}/certificate`)}
                        >
                          <Award className="h-4 w-4 mr-2" />
                          {t('details.viewCertificate', { defaultValue: 'View Certificate' })}
                        </Button>
                      )}
                    </div>
                  ) : !enrollment ? (
                    <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <p className="text-muted-foreground font-medium">
                        {t('details.enrollmentAvailable')}
                      </p>
                    </div>
                  ) : isLoadingResources ? (
                    <div className="space-y-3">
                      {[1, 2].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
                    </div>
                  ) : (
                    <ResourceList
                      resources={resources || []}
                      emptyMessage={t('details.noResources')}
                    />
                  )}
                </TabsContent>
              </div>
            </Tabs>

            {/* Related Courses Section */}
            <section className="pt-8">
              <h3 className="text-2xl font-bold mb-6">{t('details.relatedCourses')}</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {course.relatedCourses?.slice(0, 4).map((relatedCourse: any) => (
                  <CourseCard
                    key={relatedCourse.id}
                    course={relatedCourse}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Sticky Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <Card className="overflow-hidden shadow-2xl border-none ring-1 ring-black/5">
                <div className="relative aspect-video group">
                  {course.thumbnail && (
                    <Image
                      src={course.thumbnail}
                      alt={course.title || course.titleEn}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">
                      {course.price === 0 ? t('details.free') : `${course.currency} ${course.price}`}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="w-full">
                        {course?.id && (
                          <EnrollButton
                            courseId={course.id}
                            price={course.price}
                            enrollmentType={course.price === 0 ? 'free' : 'paid'}
                            isEnrolled={course.isEnrolled}
                            size="lg"
                          />
                        )}
                      </div>
                    </div>
                    <div className="h-14 w-14 shrink-0">
                      <FavoriteButton
                        entityType="course"
                        entityId={course.id}
                        isFavorited={course.isFavorited}
                        size="lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t">
                    <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                      {t('details.thisCourseIncludes', { defaultValue: 'This course includes:' })}
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Video className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{course.duration} {t('card.hoursCount', { count: course.duration })}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('details.onDemandVideo', { defaultValue: 'On-demand video' })}
                          </p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Download className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">
                            {t('details.downloadableResources', { defaultValue: 'Downloadable resources' })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('details.articlesAndFiles', { defaultValue: 'Articles and files' })}
                          </p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">
                            {t('details.certificateOfCompletion', { defaultValue: 'Certificate of completion' })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('details.shareable', { defaultValue: 'Shareable on LinkedIn' })}
                          </p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">
                            {t('details.lifetimeAccess', { defaultValue: 'Lifetime access' })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('details.mobileAndDesktop', { defaultValue: 'On mobile and desktop' })}
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="w-full">
                    <ShareButton
                      entityType="course"
                      entityId={course.id}
                      url={`/hub/courses/${course.id}`}
                      title={course.title || course.titleEn}
                      size="lg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional sidebar info like instructor briefly */}
              <Card className="p-6">
                 <h4 className="font-bold mb-4">{t('details.instructor')}</h4>
                 <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={course.instructor?.avatar} />
                      <AvatarFallback>
                        {course.instructor?.firstName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{course.instructor?.firstName} {course.instructor?.lastName}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">Expert Instructor</p>
                    </div>
                 </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <EnrollModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        course={{
          id: courseId,
          titleEn: course.title || course.titleEn,
          price: course.price,
          thumbnailUrl: course.thumbnail,
          durationHours: course.duration || course.durationHours,
        }}
        lockedLessonsCount={lockedLessonsCount}
      />
    </div>
  );
}
