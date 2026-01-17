'use client';

import { use, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCourse, useCourseLessons, useLesson } from '@/lib/hooks/use-api';
import { useCourseProgress } from '@/hooks/use-course-progress';
import { useLessonThreads } from '@/hooks/use-discussions';
import { useLessonResources } from '@/lib/hooks/use-resources-api';
import { sectionsAPI } from '@/lib/api/courses';
import { assignmentsAPI } from '@/lib/api/assignments';
import { progressAPI, type LessonProgress } from '@/lib/api/progress';
import apiClient from '@/lib/api/client';
import { PageLoader } from '@/components/loading/page-loader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notes } from '@/components/shared/notes';
import { Progress } from '@/components/ui/progress';
import { LinkedInVideoPlayer } from '@/components/video/linkedin-video-player';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  FileText, 
  PlayCircle,
  Menu,
  X,
  MessageSquare,
  BookOpen,
  ChevronDown,
  Download,
  Award,
  ClipboardCheck,
  HelpCircle,
  Lock,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { useRouter, usePathname } from '@/i18n/navigation';
import { toast } from 'sonner';
import { useQueries } from '@tanstack/react-query';

export default function LessonLearningClient({ params }: { params: Promise<{ id: string; sectionId: string; lessonId: string }> }) {
  const t = useTranslations('courses.learning');
  const router = useRouter();
  const pathname = usePathname();
  const { id, sectionId, lessonId } = use(params);
  const courseId = parseInt(id);
  const sectionIdNum = parseInt(sectionId);
  const currentLessonId = parseInt(lessonId);
  
  const { data: course, isLoading: isLoadingCourse } = useCourse(courseId);
  const { data: lesson, isLoading: isLoadingLesson } = useLesson(currentLessonId);
  const { progress, completeLesson, trackLessonProgress } = useCourseProgress(courseId);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'discussions' | 'resources'>('notes');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<number, LessonProgress>>({});

  // Fetch sections for the course
  const { data: sections, isLoading: isLoadingSections } = useQuery({
    queryKey: ['sections', courseId],
    queryFn: () => sectionsAPI.getByCourse(courseId),
    enabled: !!courseId,
  });

  // Fetch lessons for all sections
  const { data: allLessonsData, isLoading: isLoadingLessons } = useCourseLessons(courseId);

  // Get section IDs for parallel queries
  const sectionIds = useMemo(() => sections?.map(s => s.id) || [], [sections]);
  
  // Fetch quizzes and assignments for all sections in parallel
  const quizzesQueries = useQueries({
    queries: sectionIds.map(sectionId => ({
      queryKey: ['quizzes', 'section', sectionId],
      queryFn: () => apiClient.get(`/lms/quizzes/section/${sectionId}`).catch(() => []),
      enabled: !!sectionId,
    })),
  });

  const assignmentsQueries = useQueries({
    queries: sectionIds.map(sectionId => ({
      queryKey: ['assignments', 'section', sectionId],
      queryFn: () => assignmentsAPI.getBySection(sectionId).catch(() => []),
      enabled: !!sectionId,
    })),
  });

  // Extract quiz and assignment data into stable Maps
  const quizzesDataBySectionId = useMemo(() => {
    const map = new Map<number, any[]>();
    sections?.forEach((section: any, index: number) => {
      const data = quizzesQueries[index]?.data;
      if (data) {
        map.set(section.id, Array.isArray(data) ? data : []);
      }
    });
    return map;
  }, [sections, quizzesQueries.map(q => q.data).join('|')]);
  
  const assignmentsDataBySectionId = useMemo(() => {
    const map = new Map<number, any[]>();
    sections?.forEach((section: any, index: number) => {
      const data = assignmentsQueries[index]?.data;
      if (data) {
        map.set(section.id, Array.isArray(data) ? data : []);
      }
    });
    return map;
  }, [sections, assignmentsQueries.map(q => q.data).join('|')]);

  // Combine sections with nested content
  const sectionsWithContent = useMemo(() => {
    if (!sections) return [];
    
    return sections.map((section: any) => {
      const sectionLessons = allLessonsData?.filter((l: any) => l.sectionId === section.id) || [];
      const sectionQuizzes = quizzesDataBySectionId.get(section.id) || [];
      const sectionAssignments = assignmentsDataBySectionId.get(section.id) || [];
      
      return {
        ...section,
        lessons: sectionLessons.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)),
        quizzes: sectionQuizzes,
        assignments: sectionAssignments,
      };
    });
  }, [sections, allLessonsData, quizzesDataBySectionId, assignmentsDataBySectionId]);

  // Track video time for progress
  const videoTimeRef = useRef<{ startTime: number; accumulatedTime: number }>({ startTime: 0, accumulatedTime: 0 });
  const lastPositionRef = useRef<number>(0);

  // Fetch lesson progress for current lesson
  const { data: currentLessonProgress } = useQuery({
    queryKey: ['lesson-progress', currentLessonId],
    queryFn: () => progressAPI.getLessonProgress(currentLessonId).catch((error) => {
      // Handle 404 or access errors gracefully
      console.warn('Failed to fetch lesson progress:', error);
      return null;
    }),
    enabled: !!currentLessonId,
    retry: false,
  });

  // Update lesson progress map when fetched
  useEffect(() => {
    if (currentLessonProgress && currentLessonId) {
      setLessonProgressMap(prev => {
        const existing = prev[currentLessonId];
        if (existing && 
            existing.isCompleted === currentLessonProgress.isCompleted &&
            existing.timeSpentMinutes === currentLessonProgress.timeSpentMinutes) {
          return prev;
        }
        return {
          ...prev,
          [currentLessonId]: currentLessonProgress,
        };
      });
    }
  }, [currentLessonProgress?.isCompleted, currentLessonProgress?.timeSpentMinutes, currentLessonId]);

  // Fetch discussions and resources for current lesson
  const { data: lessonThreads } = useLessonThreads(currentLessonId, {
    enabled: !!currentLessonId && activeTab === 'discussions',
  });

  const { data: lessonResources } = useLessonResources(
    currentLessonId,
    !!currentLessonId && activeTab === 'resources'
  );

  // Auto-expand section containing current lesson
  const activeLessonIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (sectionsWithContent.length > 0 && currentLessonId && currentLessonId !== activeLessonIdRef.current) {
      activeLessonIdRef.current = currentLessonId;
      const section = sectionsWithContent.find((s: any) => 
        s.lessons?.some((l: any) => l.id === currentLessonId) ||
        s.quizzes?.some((q: any) => q.id === currentLessonId) ||
        s.assignments?.some((a: any) => a.id === currentLessonId)
      );
      if (section) {
        setExpandedSections(prev => {
          if (prev.has(section.id)) return prev;
          return new Set([...prev, section.id]);
        });
      }
    }
  }, [sectionsWithContent.length, currentLessonId]);

  // Track video progress periodically
  const saveVideoProgress = useCallback((currentTime: number, duration: number) => {
    if (!currentLessonId || !lesson?.videoUrl) return;

    lastPositionRef.current = currentTime;
    
    const now = Date.now();
    if (videoTimeRef.current.startTime === 0) {
      videoTimeRef.current.startTime = now;
    }

    const timeSpent = Math.floor((now - videoTimeRef.current.startTime) / 1000 / 60);
    const completionPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const isNearComplete = completionPercentage >= 95;

    trackLessonProgress({
      lessonId: currentLessonId,
      data: {
        timeSpent: timeSpent + (videoTimeRef.current.accumulatedTime || 0),
        completed: isNearComplete,
        lastPosition: currentTime,
      },
    });
  }, [currentLessonId, lesson?.videoUrl, trackLessonProgress]);

  // Handle video completion
  const handleVideoComplete = useCallback(() => {
    if (!currentLessonId) return;
    
    completeLesson(currentLessonId);
    toast.success(t('lessonCompleted', { defaultValue: 'Lesson completed!' }));
  }, [currentLessonId, completeLesson, t]);

  // Reset video tracking when lesson changes
  useEffect(() => {
    videoTimeRef.current = { startTime: 0, accumulatedTime: 0 };
    lastPositionRef.current = 0;

    if (currentLessonProgress && lesson?.videoUrl) {
      videoTimeRef.current.accumulatedTime = currentLessonProgress.timeSpentMinutes || 0;
    }
  }, [currentLessonId, lesson?.videoUrl, currentLessonProgress]);

  // Flatten all lessons for navigation
  const allLessons = useMemo(() => {
    return sectionsWithContent.flatMap((section: any) => 
      section.lessons?.map((lesson: any) => ({
        ...lesson,
        sectionTitle: section.titleEn || section.title,
        sectionId: section.id,
      })) || []
    );
  }, [sectionsWithContent]);

  // Get current lesson index and navigation
  const currentIndex = useMemo(() => 
    allLessons.findIndex(l => l.id === currentLessonId),
    [allLessons, currentLessonId]
  );
  
  const hasNext = currentIndex < allLessons.length - 1;
  const hasPrevious = currentIndex > 0;
  const nextLesson = hasNext ? allLessons[currentIndex + 1] : null;
  const previousLesson = hasPrevious ? allLessons[currentIndex - 1] : null;

  // Navigation handlers - include sectionId in route
  const navigateToLesson = (lessonId: number, targetSectionId?: number) => {
    const sectionIdToUse = targetSectionId || sectionIdNum;
    router.push(`/hub/courses/${courseId}/sections/${sectionIdToUse}/lessons/${lessonId}`);
  };

  const navigateNext = () => {
    if (nextLesson) {
      navigateToLesson(nextLesson.id, nextLesson.sectionId);
    }
  };

  const navigatePrevious = () => {
    if (previousLesson) {
      navigateToLesson(previousLesson.id, previousLesson.sectionId);
    }
  };

  // Toggle section expansion
  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  };

  const isLoading = isLoadingCourse || isLoadingSections || isLoadingLessons || isLoadingLesson;

  if (isLoading) {
    return <PageLoader message={t('loading', { defaultValue: 'Loading course...' })} />;
  }

  if (!course || !lesson) {
    return <div>{t('courseNotFound', { defaultValue: 'Course or lesson not found' })}</div>;
  }

  const isLessonCompleted = lessonProgressMap[currentLessonId]?.isCompleted || false;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Udemy Style */}
      <div className={cn(
        'flex flex-col bg-background border-r transition-all duration-300 ease-in-out',
        showSidebar ? 'w-80' : 'w-0 overflow-hidden'
      )}>
        {/* Sidebar Header */}
        <div className="h-14 border-b flex items-center justify-between px-4 shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{course.titleEn || course.title}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {progress?.progressPercentage.toFixed(0) || 0}% {t('complete', { defaultValue: 'Complete' })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowSidebar(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Course Content */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sectionsWithContent.map((section: any, sectionIndex: number) => {
              const isExpanded = expandedSections.has(section.id);
              const completedCount = section.lessons?.filter((l: any) => {
                const progress = lessonProgressMap[l.id];
                return progress?.isCompleted || l.completed;
              }).length || 0;
              const totalLessons = section.lessons?.length || 0;

              return (
                <div key={section.id} className="mb-1">
                  {/* Section Header */}
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-2.5 h-auto font-medium hover:bg-accent"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 text-start">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {sectionIndex + 1}
                      </span>
                      <span className="text-sm font-medium flex-1 truncate">
                        {section.titleEn || section.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {completedCount}/{totalLessons}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </Button>

                  {/* Section Content */}
                  {isExpanded && (
                    <div className="ps-6 rtl:ps-0 rtl:pe-6 space-y-0.5 mt-0.5">
                      {section.lessons?.map((lessonItem: any, lessonIndex: number) => {
                        const lessonProgress = lessonProgressMap[lessonItem.id];
                        const isCompleted = lessonProgress?.isCompleted || lessonItem.completed || false;
                        const isActive = currentLessonId === lessonItem.id;
                        
                        return (
                          <Button
                            key={lessonItem.id}
                            variant="ghost"
                            className={cn(
                              'w-full justify-start text-left h-auto py-2 px-2.5',
                              isActive && 'bg-accent border-l-2 border-l-primary rtl:border-l-0 rtl:border-r-2 rtl:border-r-primary'
                            )}
                            onClick={() => navigateToLesson(lessonItem.id, lessonItem.sectionId)}
                          >
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <div className="shrink-0 mt-0.5">
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-xs text-muted-foreground">
                                    {sectionIndex + 1}.{lessonIndex + 1}
                                  </span>
                                  {lessonItem.videoUrl ? (
                                    <PlayCircle className="w-3 h-3 text-muted-foreground" />
                                  ) : (
                                    <FileText className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                                <p className={cn(
                                  'text-sm line-clamp-2 leading-snug',
                                  isActive && 'font-medium'
                                )}>
                                  {lessonItem.titleEn || lessonItem.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {lessonItem.durationMinutes && (
                                    <p className="text-xs text-muted-foreground">
                                      {lessonItem.durationMinutes} {t('min', { defaultValue: 'min' })}
                                    </p>
                                  )}
                                  {lessonProgress?.timeSpentMinutes > 0 && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                                      {Math.floor(lessonProgress.timeSpentMinutes)} {t('minWatched', { defaultValue: 'min watched' })}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area - Udemy Style */}
      <div className="flex-1 flex flex-col bg-black min-w-0">
        {/* Top Bar */}
        <div className="h-14 bg-background border-b flex items-center px-4 gap-4 shrink-0">
          {!showSidebar && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSidebar(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{lesson.titleEn || lesson.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {progress && (
              <div className="hidden sm:flex items-center gap-2">
                <Progress value={progress.progressPercentage} className="w-24 h-1.5" />
                <span className="text-xs text-muted-foreground">
                  {progress.progressPercentage.toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Video/Content Player Area */}
        <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
          {lesson.videoUrl ? (
            <LinkedInVideoPlayer
              src={lesson.videoUrl}
              poster={(course as any).thumbnailUrl || (course as any).thumbnail}
              chapters={[]}
              transcript={[]}
              className="w-full h-full"
              onProgress={saveVideoProgress}
              onComplete={handleVideoComplete}
              autoPlay={false}
            />
          ) : (
            <Card className="m-8 p-8 bg-background max-w-4xl max-h-full overflow-auto">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <h1 className="text-2xl font-bold mb-4">{lesson.titleEn || lesson.title}</h1>
                {lesson.descriptionEn && (
                  <p className="text-muted-foreground mb-4">{lesson.descriptionEn}</p>
                )}
                {lesson.attachmentUrl && (
                  <div className="mb-4">
                    <Button variant="outline" asChild>
                      <a href={lesson.attachmentUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 me-2" />
                        {t('downloadAttachment', { defaultValue: 'Download Attachment' })}
                      </a>
                    </Button>
                  </div>
                )}
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ 
                    __html: lesson.contentEn || lesson.content || t('noContent', { defaultValue: 'Lesson content will appear here.' })
                  }}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <div className="h-16 bg-background border-t flex items-center justify-between px-6 shrink-0">
          <Button
            variant="outline"
            onClick={navigatePrevious}
            disabled={!hasPrevious}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('previous', { defaultValue: 'Previous' })}
          </Button>

          <div className="flex items-center gap-4">
            {!isLessonCompleted && (
              <Button
                onClick={() => {
                  completeLesson(currentLessonId);
                  toast.success(t('lessonMarkedComplete', { defaultValue: 'Lesson marked as complete!' }));
                }}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {t('markComplete', { defaultValue: 'Mark as complete' })}
              </Button>
            )}
            {isLessonCompleted && (
              <Badge variant="default" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                {t('completed', { defaultValue: 'Completed' })}
              </Badge>
            )}
          </div>

          <Button
            variant="default"
            onClick={navigateNext}
            disabled={!hasNext}
            className="gap-2"
          >
            {t('next', { defaultValue: 'Next' })}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Panel - Notes, Discussions, Resources */}
      <div className="w-80 border-l bg-background flex flex-col shrink-0">
        <div className="h-14 border-b flex items-center justify-between px-4 shrink-0">
          <h3 className="font-semibold text-sm">{t('resources', { defaultValue: 'Resources' })}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {/* Close panel */}}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="notes" className="text-xs">
              <BookOpen className="h-3 w-3 me-1" />
              {t('notes', { defaultValue: 'Notes' })}
            </TabsTrigger>
            <TabsTrigger value="discussions" className="text-xs">
              <MessageSquare className="h-3 w-3 me-1" />
              {t('discussions', { defaultValue: 'Discussions' })}
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-xs">
              <Download className="h-3 w-3 me-1" />
              {t('resources', { defaultValue: 'Resources' })}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <TabsContent value="notes" className="mt-4">
                <Notes lessonId={currentLessonId} />
              </TabsContent>
              <TabsContent value="discussions" className="mt-4">
                {lessonThreads && lessonThreads.length > 0 ? (
                  <div className="space-y-2">
                    {lessonThreads.map((thread: any) => (
                      <Card key={thread.id} className="p-3">
                        <p className="text-sm">{thread.title}</p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t('noDiscussions', { defaultValue: 'No discussions yet' })}
                  </p>
                )}
              </TabsContent>
              <TabsContent value="resources" className="mt-4">
                {lessonResources && lessonResources.length > 0 ? (
                  <div className="space-y-2">
                    {lessonResources.map((resource: any) => (
                      <Card key={resource.id} className="p-3">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <a href={resource.fileUrl} download className="text-sm hover:underline">
                            {resource.titleEn || resource.title}
                          </a>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t('noResources', { defaultValue: 'No resources available' })}
                  </p>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
