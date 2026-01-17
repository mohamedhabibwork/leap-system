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
import { Star, Clock, Users, PlayCircle, FileText, Award, ChevronRight, CheckCircle2, Video, Download, Trophy, Globe, Lock, ChevronDown, ChevronUp, ClipboardCheck, HelpCircle, Menu } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { use, useState, useEffect, useMemo } from 'react';
import { AnalyticsEvents } from '@/lib/firebase/analytics';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { useSectionQuizzes, useSectionAssignments } from '@/hooks/use-section-content';
import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { LookupTypeCode } from '@leap-lms/shared-types';

export default function CourseDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('courses');
  const router = useRouter();
  const { id } = use(params);
  const courseId = parseInt(id);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: courseData, isLoading } = useCourse(courseId);
  const course = courseData ;
  const { data: lessons, isLoading: isLoadingLessons } = useCourseLessons(courseId);
  const { data: enrollment } = useEnrollmentWithType(courseId);
  const { data: resources, isLoading: isLoadingResources } = useCourseResources(courseId, !!enrollment);
  const { data: reviews } = useCourseReviews(courseId);
  const { data: contentTypeLookups } = useLookupsByType(LookupTypeCode.CONTENT_TYPE);
  
  // Create a map of contentTypeId to contentType code
  const contentTypeMap = useMemo(() => {
    const map = new Map<number, string>();
    contentTypeLookups?.forEach((lookup: any) => {
      map.set(lookup.id, lookup.code);
    });
    return map;
  }, [contentTypeLookups]);

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

  // Group lessons by section for curriculum display
  const lessonsBySection = useMemo(() => {
    if (!lessons) return {};
    return lessons.reduce((acc: any, lesson: any) => {
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
    }, {});
  }, [lessons]);

  const sections = useMemo(() => Object.values(lessonsBySection), [lessonsBySection]);
  
  // Get section IDs for fetching quizzes and assignments
  const sectionIds = useMemo(() => {
    return sections.map((s: any) => s.id);
  }, [sections]);
  
  // Fetch quizzes for expanded sections (lazy loading - only when section is expanded)
  const { quizzesBySectionId: quizzesBySection } = useSectionQuizzes(sectionIds, {
    enabled: (sectionId) => expandedSections.has(sectionId) && !!sectionId,
    staleTime: 5 * 60 * 1000, // 5 minutes - quizzes don't change frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
  
  // Fetch assignments for expanded sections (lazy loading - only when section is expanded)
  const { assignmentsBySectionId: assignmentsBySection } = useSectionAssignments(sectionIds, {
    enabled: (sectionId) => expandedSections.has(sectionId) && !!sectionId,
    staleTime: 5 * 60 * 1000, // 5 minutes - assignments don't change frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

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

  const handleLessonClick = (lesson: any, sectionId: number) => {
    try {
      const contentTypeCode = contentTypeMap.get(lesson.contentTypeId);
      
      if (contentTypeCode === 'quiz') {
        // Find quiz linked to this lesson
        const sectionQuizzes = quizzesBySection.get(sectionId) || [];
        const lessonQuiz = sectionQuizzes.find((q: any) => q.lessonId === lesson.id);
        
        if (lessonQuiz) {
          router.push(`/hub/quizzes/${lessonQuiz.id}/take`);
          AnalyticsEvents.clickNavigation(
            `/hub/quizzes/${lessonQuiz.id}/take`,
            'course_detail'
          );
        } else {
          // If no quiz found, navigate to lesson page
          router.push(`/hub/courses/${courseId}/learn/lessons/${lesson.id}`);
        }
      } else if (contentTypeCode === 'assignment') {
        // Find assignment in this section (assignments are section-level)
        const sectionAssignments = assignmentsBySection.get(sectionId) || [];
        const assignment = sectionAssignments[0]; // Get first assignment or implement better matching
        
        if (assignment) {
          // Navigate to assignment page (adjust route as needed)
          router.push(`/hub/courses/${courseId}/assignments/${assignment.id}`);
          AnalyticsEvents.clickNavigation(
            `/hub/courses/${courseId}/assignments/${assignment.id}`,
            'course_detail'
          );
        } else {
          // If no assignment found, navigate to lesson page
          router.push(`/hub/courses/${courseId}/learn/lessons/${lesson.id}`);
        }
      } else {
        // For video, text, document - navigate to lesson page
        router.push(`/hub/courses/${courseId}/learn/lessons/${lesson.id}`);
        AnalyticsEvents.clickNavigation(
          `/hub/courses/${courseId}/learn/lessons/${lesson.id}`,
          'course_detail'
        );
      }
    } catch (analyticsError) {
      // Silently fail analytics
    }
  };
  
  const getLessonIcon = (lesson: any) => {
    const contentTypeCode = contentTypeMap.get(lesson.contentTypeId);
    
    switch (contentTypeCode) {
      case 'quiz':
        return <HelpCircle className="w-5 h-5 text-muted-foreground shrink-0" />;
      case 'assignment':
        return <ClipboardCheck className="w-5 h-5 text-muted-foreground shrink-0" />;
      case 'video':
        return <PlayCircle className="w-5 h-5 text-muted-foreground shrink-0" />;
      case 'document':
        return <FileText className="w-5 h-5 text-muted-foreground shrink-0" />;
      case 'text':
        return <FileText className="w-5 h-5 text-muted-foreground shrink-0" />;
      default:
        return <Lock className="w-5 h-5 text-muted-foreground shrink-0" />;
    }
  };
  
  const getLessonTypeLabel = (lesson: any) => {
    const contentTypeCode = contentTypeMap.get(lesson.contentTypeId);
    
    switch (contentTypeCode) {
      case 'quiz':
        return 'Quiz';
      case 'assignment':
        return 'Assignment';
      case 'video':
        return 'Video';
      case 'document':
        return 'Document';
      case 'text':
        return 'Text';
      default:
        return 'Lesson';
    }
  };

  // Calculate average rating
  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
    : course.rating || 4.8;

  // If not enrolled, show Udemy-style landing page
  if (!isEnrolled) {
    // Pricing Card Component (reusable) - Responsive Design
    const PricingCard = ({ className, isMobile = false }: { className?: string; isMobile?: boolean }) => (
      <Card className={cn("overflow-hidden shadow-lg border border-gray-200 dark:border-border bg-white dark:bg-card", className)}>
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
                        <Video className="w-16 h-16 sm:w-20 sm:h-20 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                          <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" />
                        </div>
                        <p className="text-white text-xs sm:text-sm font-medium">Preview this course</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-foreground">
                        {course.price === 0 || !course.price ? t('details.free') : `${course.currency || '$'}${course.price}`}
                      </span>
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                      <div className="flex-1">
                        {course?.id && (
                          <EnrollButton
                            courseId={course.id}
                            price={course.price}
                            enrollmentType={course.price === 0 ? 'free' : 'paid'}
                            isEnrolled={false}
                            size={isMobile ? "default" : "lg"}
                          />
                        )}
                      </div>
                      <div className={cn("shrink-0", isMobile ? "h-10 w-10" : "h-14 w-14")}>
                        <FavoriteButton
                          entityType="course"
                          entityId={course.id}
                          isFavorited={course.isFavorited}
                          size={isMobile ? "default" : "lg"}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-border">
                      <p className="font-bold text-xs sm:text-sm uppercase tracking-wider text-muted-foreground">
                        {t('details.thisCourseIncludes', { defaultValue: 'This course includes:' })}
                      </p>
                      <ul className="space-y-2 sm:space-y-3">
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Video className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-xs sm:text-sm text-foreground">{course.duration || course.durationHours} {t('card.hoursCount', { count: course.duration || course.durationHours })} on-demand video</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-xs sm:text-sm text-foreground">
                              {lessons?.length || 0} {t('card.lessonsCount', { count: lessons?.length || 0 })}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Download className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-xs sm:text-sm text-foreground">
                              {t('details.downloadableResources', { defaultValue: 'Downloadable resources' })}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Award className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-xs sm:text-sm text-foreground">
                              {t('details.certificateOfCompletion', { defaultValue: 'Certificate of completion' })}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2 sm:gap-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-xs sm:text-sm text-foreground">
                              {t('details.lifetimeAccess', { defaultValue: 'Full lifetime access' })}
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="w-full pt-3 sm:pt-4 border-t border-gray-200 dark:border-border">
                      <ShareButton
                        entityType="course"
                        entityId={course.id}
                        url={`/hub/courses/${course.id}`}
                        title={course.title || course.titleEn}
                        size={isMobile ? "default" : "lg"}
                      />
                    </div>
                  </CardContent>
                </Card>
    );

    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-background">
        {/* Hero Section - Clean White Background with Responsive Design */}
        <div className="bg-white dark:bg-background border-b border-gray-200 dark:border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* Mobile Header with Menu Button */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Link href="/hub/courses" className="hover:text-foreground transition-colors">
                  {t('list.title')}
                </Link>
                <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                <span className="text-foreground truncate">{course.category || 'Category'}</span>
              </nav>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-left">{course.title || course.titleEn}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <PricingCard isMobile={true} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
              {/* Left Content */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Breadcrumb - Hidden on mobile, shown above */}
                <nav className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href="/hub/courses" className="hover:text-foreground transition-colors">
                    {t('list.title')}
                  </Link>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  <span className="text-foreground">{course.category || 'Category'}</span>
                </nav>
                
                {/* Title & Description - Responsive Typography */}
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
                    {course.title || course.titleEn}
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
                    {course.description || course.descriptionEn}
                  </p>
                </div>
                
                {/* Course Stats - Responsive Design */}
                <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 items-center text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400 shrink-0" />
                    <span className="font-bold text-base sm:text-lg text-foreground">{avgRating.toFixed(1)}</span>
                    <span className="text-muted-foreground hidden sm:inline">
                      ({reviews?.length || course.reviewCount || 0} {t('details.reviews')})
                    </span>
                    <span className="text-muted-foreground sm:hidden">
                      ({reviews?.length || course.reviewCount || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 border-s border-gray-200 dark:border-border ps-3 sm:ps-6 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-3 sm:rtl:pe-6">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground text-xs sm:text-sm">
                      {(course.enrollmentCount || 0).toLocaleString()} {t('card.studentsCount', { count: course.enrollmentCount || 0 })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 border-s border-gray-200 dark:border-border ps-3 sm:ps-6 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-3 sm:rtl:pe-6">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground text-xs sm:text-sm">
                      {course.duration || course.durationHours} {t('card.hoursCount', { count: course.duration || course.durationHours })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 border-s border-gray-200 dark:border-border ps-3 sm:ps-6 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-3 sm:rtl:pe-6">
                    <Badge variant="outline" className="border-gray-300 dark:border-border text-xs">
                      {course.level || 'Beginner'}
                    </Badge>
                  </div>
                </div>

                {/* Instructor - Responsive */}
                <div className="flex items-center gap-3 sm:gap-4 pt-2">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-200 dark:border-border shrink-0">
                    <AvatarImage src={course.instructor?.avatar} />
                    <AvatarFallback className="bg-muted text-foreground text-sm sm:text-base">
                      {course.instructor?.firstName?.[0] || course.instructor?.name?.[0]}
                      {course.instructor?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-muted-foreground uppercase tracking-wider text-[9px] sm:text-[10px] font-bold">
                      {t('details.instructor')}
                    </p>
                    <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                      {course.instructor?.firstName} {course.instructor?.lastName} {course.instructor?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right - Sticky Pricing Card - Hidden on Mobile, Shown in Sheet */}
              <div className="hidden lg:block lg:col-span-1">
                <PricingCard className="sticky top-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Clean White Background with Responsive Design */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 w-full bg-white dark:bg-background">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <Tabs defaultValue="overview" className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border overflow-hidden">
                <TabsList className="w-full justify-start border-b border-gray-200 dark:border-border rounded-none bg-transparent h-12 sm:h-14 px-3 sm:px-6 gap-4 sm:gap-6 lg:gap-8 overflow-x-auto no-scrollbar">
                  <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none bg-transparent shadow-none px-0 h-full font-semibold text-muted-foreground text-sm sm:text-base whitespace-nowrap">{t('details.overview')}</TabsTrigger>
                  <TabsTrigger value="curriculum" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none bg-transparent shadow-none px-0 h-full font-semibold text-muted-foreground text-sm sm:text-base whitespace-nowrap">{t('details.curriculum')}</TabsTrigger>
                  <TabsTrigger value="instructor" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none bg-transparent shadow-none px-0 h-full font-semibold text-muted-foreground text-sm sm:text-base whitespace-nowrap">{t('details.instructor')}</TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none bg-transparent shadow-none px-0 h-full font-semibold text-muted-foreground text-sm sm:text-base whitespace-nowrap">{t('details.reviews')}</TabsTrigger>
                </TabsList>

                <div className="p-4 sm:p-6 lg:p-8">
                  <TabsContent value="overview" className="mt-0 space-y-6 sm:space-y-8 lg:space-y-10">
                    {/* Skills You'll Gain Section */}
                    {course.skills && course.skills.length > 0 && (
                      <section>
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">
                          {t('details.skillsYouWillGain', { defaultValue: "Skills you'll gain" })}
                        </h3>
                        <SkillsList skills={course.skills || []} />
                      </section>
                    )}

                    {/* What You'll Learn - Udemy Style with Responsive Grid */}
                    <section>
                      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">{t('details.whatYouWillLearn')}</h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {course.learningOutcomes?.map((outcome: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 sm:gap-3">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-green-600 dark:text-green-500 shrink-0" />
                            <span className="leading-relaxed text-sm sm:text-base text-foreground">{outcome}</span>
                          </div>
                        ))}
                        {(!course.learningOutcomes || course.learningOutcomes.length === 0) && (
                          <p className="text-muted-foreground italic col-span-2 text-sm sm:text-base">No outcomes specified</p>
                        )}
                      </div>
                    </section>

                    {/* Requirements */}
                    <section>
                      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">{t('details.requirements')}</h3>
                      {course.requirements && course.requirements.length > 0 ? (
                        <ul className="space-y-2">
                          {course.requirements.map((req: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 sm:gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                              <span className="text-sm sm:text-base text-foreground">{req}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground italic text-sm sm:text-base">No requirements specified</p>
                      )}
                    </section>

                    {/* Course Content Summary */}
                    <section>
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground">{t('details.courseContent')}</h3>
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-muted-foreground">
                        <span className="flex items-center gap-2 text-sm sm:text-base">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                          <span className="font-semibold text-foreground">
                            {lessons?.length || 0}
                          </span>{' '}
                          {t('card.lessonsCount', { count: lessons?.length || 0 })}
                        </span>
                        <span className="flex items-center gap-2 text-sm sm:text-base">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                          <span className="font-semibold text-foreground">
                            {course.duration || course.durationHours}
                          </span>{' '}
                          {t('card.hoursCount', { count: course.duration || course.durationHours })}
                        </span>
                        <span className="flex items-center gap-2 text-sm sm:text-base">
                          <Globe className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                          <span className="font-semibold text-foreground">English</span>
                        </span>
                      </div>
                    </section>
                  </TabsContent>

                  <TabsContent value="curriculum" className="mt-0">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-foreground">{t('details.curriculum')}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {lessons?.length || 0} {t('card.lessonsCount', { count: lessons?.length || 0 })}
                          </p>
                        </div>
                      </div>

                      {isLoadingLessons ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
                        </div>
                      ) : sections.length > 0 ? (
                        <div className="space-y-1">
                          {sections.map((section: any) => (
                            <Collapsible
                              key={section.id}
                              open={expandedSections.has(section.id)}
                              onOpenChange={() => toggleSection(section.id)}
                            >
                              <CollapsibleTrigger className="w-full">
                                <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-border rounded hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors">
                                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    {expandedSections.has(section.id) ? (
                                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                                    )}
                                    <div className="text-start flex-1 min-w-0">
                                      <h4 className="font-bold text-sm sm:text-base text-foreground truncate">{section.title}</h4>
                                      <p className="text-xs sm:text-sm text-muted-foreground">
                                        {section.lessons.length} {t('card.lessonsCount', { count: section.lessons.length })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="border-x border-b border-gray-200 dark:border-border rounded-b-lg divide-y divide-gray-200 dark:divide-border">
                                  {section.lessons.map((lesson: any) => {
                                    const canAccess = lesson.canAccess || isEnrolled || lesson.isPreview;
                                    const lessonType = getLessonTypeLabel(lesson);
                                    
                                    return (
                                      <div
                                        key={lesson.id}
                                        onClick={() => canAccess && handleLessonClick(lesson, section.id)}
                                        className={cn(
                                          "p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4 transition-colors",
                                          canAccess ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-muted/30" : "cursor-not-allowed opacity-60 bg-gray-50/50 dark:bg-muted/20"
                                        )}
                                      >
                                        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                          <div className="shrink-0">
                                            {getLessonIcon(lesson)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className={cn(
                                              "font-medium text-xs sm:text-sm truncate",
                                              canAccess ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                              {lesson.titleEn || lesson.title}
                                            </h5>
                                            <div className="flex items-center gap-2 sm:gap-4 mt-1 text-[10px] sm:text-xs text-muted-foreground">
                                              <span className="truncate">{lessonType}</span>
                                              {lesson.durationMinutes && (
                                                <span className="flex items-center gap-1 shrink-0">
                                                  <Clock className="w-3 h-3" />
                                                  {lesson.durationMinutes} min
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        {canAccess ? (
                                          lesson.isPreview ? (
                                            <Badge variant="outline" className="shrink-0 text-[10px] sm:text-xs">Preview</Badge>
                                          ) : null
                                        ) : (
                                          <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-border rounded-xl">
                          <p className="text-muted-foreground">{t('details.noLessons')}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="instructor" className="mt-0">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <Avatar className="w-24 h-24 border-2 border-gray-200 dark:border-border">
                        <AvatarImage src={course.instructor?.avatar} />
                        <AvatarFallback className="text-2xl font-bold bg-muted">
                          {course.instructor?.firstName?.[0] || course.instructor?.name?.[0]}
                          {course.instructor?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold mb-1 text-foreground">
                            {course.instructor?.firstName} {course.instructor?.lastName} {course.instructor?.name}
                          </h3>
                          <p className="text-muted-foreground">
                            {t('details.expertInstructor', { defaultValue: 'Expert Instructor' })}
                          </p>
                        </div>
                        <p className="text-foreground leading-relaxed">
                          {course.instructor?.bio || "Experienced professional sharing knowledge with learners worldwide."}
                        </p>
                        <div className="flex flex-wrap gap-6 pt-2">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-foreground">4.8</span>
                            <span className="text-muted-foreground text-sm">
                              {t('details.instructorRating', { defaultValue: 'Instructor Rating' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            <span className="font-bold text-foreground">15,000+</span>
                            <span className="text-muted-foreground text-sm">
                              {t('details.students', { defaultValue: 'Students' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-muted-foreground" />
                            <span className="font-bold text-foreground">12</span>
                            <span className="text-muted-foreground text-sm">
                              {t('details.courses', { defaultValue: 'Courses' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-0">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-border">
                        <h3 className="text-2xl font-bold text-foreground">{t('details.ratingsAndReviews')}</h3>
                        <div className="flex items-center gap-2">
                          <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                          <span className="text-2xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
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

  // If enrolled, show the learning interface - Udemy Style with Responsive Design
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-background">
      {/* Clean White Hero Section - Responsive */}
      <div className="bg-white dark:bg-background border-b border-gray-200 dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Breadcrumb - Responsive */}
              <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Link href="/hub/courses" className="hover:text-foreground transition-colors">
                  {t('list.title')}
                </Link>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl:rotate-180" />
                <span className="text-foreground truncate">{course.category || 'Category'}</span>
              </nav>
              
              {/* Title & Description - Responsive Typography */}
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
                  {course.title || course.titleEn}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
                  {course.description || course.descriptionEn}
                </p>
              </div>
              
              {/* Course Stats - Responsive */}
              <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 items-center text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400 shrink-0" />
                  <span className="font-bold text-base sm:text-lg text-foreground">{course.rating || '4.8'}</span>
                  <span className="text-muted-foreground hidden sm:inline">
                    ({(course.reviewCount || 0).toLocaleString()} {t('details.reviews')})
                  </span>
                  <span className="text-muted-foreground sm:hidden">
                    ({(course.reviewCount || 0).toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 border-s border-gray-200 dark:border-border ps-3 sm:ps-6 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-3 sm:rtl:pe-6">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground text-xs sm:text-sm">{(course.enrollmentCount || 0).toLocaleString()} {t('card.studentsCount', { count: course.enrollmentCount || 0 })}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 border-s border-gray-200 dark:border-border ps-3 sm:ps-6 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-3 sm:rtl:pe-6">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground text-xs sm:text-sm">{course.duration} {t('card.hoursCount', { count: course.duration })}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 border-s border-gray-200 dark:border-border ps-3 sm:ps-6 rtl:border-s-0 rtl:border-e rtl:ps-0 rtl:pe-3 sm:rtl:pe-6">
                  <Badge variant="outline" className="border-gray-300 dark:border-border text-xs">
                    {course.level || 'Beginner'}
                  </Badge>
                </div>
              </div>

              {/* Instructor - Responsive */}
              <div className="flex items-center gap-3 sm:gap-4 pt-2">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-200 dark:border-border shrink-0">
                  <AvatarImage src={course.instructor?.avatar} />
                  <AvatarFallback className="bg-muted text-foreground text-sm sm:text-base">
                    {course.instructor?.firstName?.[0]}
                    {course.instructor?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-muted-foreground uppercase tracking-wider text-[9px] sm:text-[10px] font-bold">
                    {t('details.instructor')}
                  </p>
                  <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Video Preview Card - Hidden on Mobile */}
            <div className="hidden lg:block lg:col-span-1">
              <Card className="overflow-hidden shadow-lg border border-gray-200 dark:border-border sticky top-4 bg-white dark:bg-card">
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
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                        <PlayCircle className="w-10 h-10 text-white" fill="currentColor" />
                      </div>
                      <p className="text-white text-sm font-medium">Continue Learning</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 pb-12 sm:pb-16 lg:pb-20 w-full bg-white dark:bg-background">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <Tabs defaultValue="overview" className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border overflow-hidden">
              <TabsList className="w-full justify-start border-b border-gray-200 dark:border-border rounded-none bg-transparent h-12 sm:h-14 px-3 sm:px-6 gap-4 sm:gap-6 lg:gap-8 overflow-x-auto no-scrollbar">
                <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none bg-transparent shadow-none px-0 h-full font-semibold text-muted-foreground text-sm sm:text-base whitespace-nowrap">{t('details.overview')}</TabsTrigger>
                <TabsTrigger value="curriculum" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none bg-transparent shadow-none px-0 h-full font-semibold text-muted-foreground text-sm sm:text-base whitespace-nowrap">{t('details.curriculum')}</TabsTrigger>
                <TabsTrigger value="instructor" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none bg-transparent shadow-none px-0 h-full font-semibold text-muted-foreground text-sm sm:text-base whitespace-nowrap">{t('details.instructor')}</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none bg-transparent shadow-none px-0 h-full font-semibold text-muted-foreground text-sm sm:text-base whitespace-nowrap">{t('details.reviews')}</TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none bg-transparent shadow-none px-0 h-full font-semibold text-muted-foreground text-sm sm:text-base whitespace-nowrap">{t('details.resources')}</TabsTrigger>
              </TabsList>

              <div className="p-8">
                <TabsContent value="overview" className="mt-0 space-y-10">
                  {/* Skills You'll Gain Section */}
                  {course.skills && course.skills.length > 0 && (
                    <section>
                      <h3 className="text-2xl font-bold mb-6 text-foreground">
                        {t('details.skillsYouWillGain', { defaultValue: "Skills you'll gain" })}
                      </h3>
                      <SkillsList skills={course.skills || []} />
                    </section>
                  )}

                  {/* What You'll Learn - Udemy Style */}
                  <section>
                    <h3 className="text-2xl font-bold mb-6 text-foreground">{t('details.whatYouWillLearn')}</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {course.learningOutcomes?.map((outcome: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600 dark:text-green-500 shrink-0" />
                          <span className="leading-relaxed text-foreground">{outcome}</span>
                        </div>
                      ))}
                      {(!course.learningOutcomes || course.learningOutcomes.length === 0) && (
                        <p className="text-muted-foreground italic col-span-2">No outcomes specified</p>
                      )}
                    </div>
                  </section>

                  {/* Requirements */}
                  <section>
                    <h3 className="text-2xl font-bold mb-6 text-foreground">{t('details.requirements')}</h3>
                    {course.requirements && course.requirements.length > 0 ? (
                      <ul className="space-y-2">
                        {course.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                            <span className="text-foreground">{req}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground italic">No requirements specified</p>
                    )}
                  </section>

                  {/* Course Content Summary */}
                  <section>
                    <h3 className="text-2xl font-bold mb-4 text-foreground">{t('details.courseContent')}</h3>
                    <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
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

                    <div className="space-y-1">
                      {isLoadingLessons ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
                        </div>
                      ) : sections.length > 0 ? (
                        sections.map((section: any) => (
                          <Collapsible
                            key={section.id}
                            open={expandedSections.has(section.id)}
                            onOpenChange={() => toggleSection(section.id)}
                          >
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-border rounded hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3 flex-1">
                                  {expandedSections.has(section.id) ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                                  )}
                                  <div className="text-start flex-1">
                                    <h4 className="font-bold text-base text-foreground">{section.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {section.lessons.length} {t('card.lessonsCount', { count: section.lessons.length })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="border-x border-b border-gray-200 dark:border-border rounded-b-lg divide-y divide-gray-200 dark:divide-border">
                                {section.lessons.map((lesson: any) => {
                                  const canAccess = lesson.canAccess || isEnrolled || lesson.isPreview;
                                  const lessonType = getLessonTypeLabel(lesson);
                                  
                                  return (
                                    <div
                                      key={lesson.id}
                                      onClick={() => canAccess && handleLessonClick(lesson, section.id)}
                                      className={cn(
                                        "p-4 flex items-center justify-between gap-4 transition-colors",
                                        canAccess ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-muted/30" : "cursor-not-allowed opacity-60 bg-gray-50/50 dark:bg-muted/20"
                                      )}
                                    >
                                      <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="shrink-0">
                                          {getLessonIcon(lesson)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className={cn(
                                            "font-medium text-sm truncate",
                                            canAccess ? "text-foreground" : "text-muted-foreground"
                                          )}>
                                            {lesson.titleEn || lesson.title}
                                          </h5>
                                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                            <span>{lessonType}</span>
                                            {lesson.durationMinutes && (
                                              <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {lesson.durationMinutes} min
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      {canAccess ? (
                                        lesson.isPreview ? (
                                          <Badge variant="outline" className="shrink-0 text-xs">Preview</Badge>
                                        ) : null
                                      ) : (
                                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-border rounded-xl">
                          <p className="text-muted-foreground">{t('details.noLessons')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="instructor" className="mt-0">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <Avatar className="w-24 h-24 border-2 border-gray-200 dark:border-border">
                      <AvatarImage src={course.instructor?.avatar} />
                      <AvatarFallback className="text-2xl font-bold bg-muted">
                        {course.instructor?.firstName?.[0]}
                        {course.instructor?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1 text-foreground">
                          {course.instructor?.firstName} {course.instructor?.lastName}
                        </h3>
                        <p className="text-muted-foreground">
                          {t('details.expertInstructor', { defaultValue: 'Expert Instructor' })}
                        </p>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {course.instructor?.bio || "Experienced professional sharing knowledge with learners worldwide."}
                      </p>
                      <div className="flex flex-wrap gap-6 pt-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-foreground">4.8</span>
                          <span className="text-muted-foreground text-sm">
                            {t('details.instructorRating', { defaultValue: 'Instructor Rating' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-muted-foreground" />
                          <span className="font-bold text-foreground">15,000+</span>
                          <span className="text-muted-foreground text-sm">
                            {t('details.students', { defaultValue: 'Students' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-muted-foreground" />
                          <span className="font-bold text-foreground">12</span>
                          <span className="text-muted-foreground text-sm">
                            {t('details.courses', { defaultValue: 'Courses' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-border">
                      <h3 className="text-2xl font-bold text-foreground">{t('details.ratingsAndReviews')}</h3>
                      <div className="flex items-center gap-2">
                        <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                        <span className="text-2xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
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

                <TabsContent value="resources" className="mt-0">
                  {isLoadingResources ? (
                    <div className="space-y-3">
                      {[1, 2].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
                    </div>
                  ) : resources && resources.length > 0 ? (
                    <ResourceList
                      resources={resources || []}
                      emptyMessage={t('details.noResources')}
                    />
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-border rounded-xl">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <p className="text-muted-foreground font-medium">
                        {t('details.noResources', { defaultValue: 'No resources available' })}
                      </p>
                    </div>
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

          {/* Sticky Sidebar - Udemy Style */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <Card className="overflow-hidden shadow-lg border border-gray-200 dark:border-border bg-white dark:bg-card">
                <div className="relative aspect-video group cursor-pointer bg-black">
                  {course.thumbnail && (
                    <Image
                      src={course.thumbnail}
                      alt={course.title || course.titleEn}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                        <PlayCircle className="w-10 h-10 text-white" fill="currentColor" />
                      </div>
                      <p className="text-white text-sm font-medium">Continue Learning</p>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-6">
                  {enrollment && enrollment.progressPercentage > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('details.progress', { defaultValue: 'Your progress' })}</span>
                        <span className="font-semibold text-foreground">{enrollment.progressPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={enrollment.progressPercentage} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => router.push(`/hub/courses/${courseId}/learn`)}
                      >
                        {t('details.continueLearning', { defaultValue: 'Continue Learning' })}
                      </Button>
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

                  {enrollment && enrollment.progressPercentage === 100 && (
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

                  <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-border">
                    <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                      {t('details.thisCourseIncludes', { defaultValue: 'This course includes:' })}
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Video className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">{course.duration} {t('card.hoursCount', { count: course.duration })} on-demand video</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">
                            {lessons?.length || 0} {t('card.lessonsCount', { count: lessons?.length || 0 })}
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Download className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">
                            {t('details.downloadableResources', { defaultValue: 'Downloadable resources' })}
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Award className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">
                            {t('details.certificateOfCompletion', { defaultValue: 'Certificate of completion' })}
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Globe className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">
                            {t('details.lifetimeAccess', { defaultValue: 'Full lifetime access' })}
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="w-full pt-4 border-t border-gray-200 dark:border-border">
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

              {/* Instructor Card */}
              <Card className="p-6 border border-gray-200 dark:border-border bg-white dark:bg-card">
                 <h4 className="font-bold mb-4 text-foreground">{t('details.instructor')}</h4>
                 <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border border-gray-200 dark:border-border">
                      <AvatarImage src={course.instructor?.avatar} />
                      <AvatarFallback className="bg-muted">
                        {course.instructor?.firstName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{course.instructor?.firstName} {course.instructor?.lastName}</p>
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
