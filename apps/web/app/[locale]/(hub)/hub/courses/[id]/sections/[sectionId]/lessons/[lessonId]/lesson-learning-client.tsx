'use client';

import { use, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCourse, useCourseLessons, useLesson } from '@/lib/hooks/use-api';
import { useCourseProgress } from '@/hooks/use-course-progress';
import { useLessonThreads } from '@/hooks/use-discussions';
import { useLessonResources } from '@/lib/hooks/use-resources-api';
import { sectionsAPI } from '@/lib/api/courses';
import { progressAPI, type LessonProgress } from '@/lib/api/progress';
import { PageLoader } from '@/components/loading/page-loader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notes } from '@/components/shared/notes';
import { Progress } from '@/components/ui/progress';
import { LinkedInVideoPlayer } from '@/components/video/linkedin-video-player';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
import { useSectionQuizzes, useSectionAssignments } from '@/hooks/use-section-content';

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
  
  const [showSidebar, setShowSidebar] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'discussions' | 'resources'>('notes');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<number, LessonProgress>>({});
  const hasLoadedSavedState = useRef(false);

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
  const { quizzesBySectionId: quizzesDataBySectionId } = useSectionQuizzes(sectionIds);
  const { assignmentsBySectionId: assignmentsDataBySectionId } = useSectionAssignments(sectionIds);

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

  // Track time for progress (works for both video and text lessons)
  const lessonTimeRef = useRef<{ startTime: number; accumulatedTime: number; lastSaveTime: number }>({ 
    startTime: 0, 
    accumulatedTime: 0,
    lastSaveTime: 0 
  });
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

  // Load saved state and set initial sidebar/panel state on client only to prevent hydration mismatches
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedSidebar = localStorage.getItem('lesson-learning-sidebar-state');
      const savedRightPanel = localStorage.getItem('lesson-learning-right-panel-state');
      
      // Use saved state if available, otherwise default to true
      if (savedSidebar !== null) {
        setShowSidebar(savedSidebar === 'true');
      } else {
        setShowSidebar(true);
      }
      
      if (savedRightPanel !== null) {
        setShowRightPanel(savedRightPanel === 'true');
      } else {
        setShowRightPanel(true);
      }
      
      hasLoadedSavedState.current = true;
    } catch (error) {
      console.warn('Failed to load saved state from localStorage:', error);
      // Default to true if localStorage is unavailable
      setShowSidebar(true);
      setShowRightPanel(true);
      hasLoadedSavedState.current = true;
    }
  }, []);

  // Save sidebar state to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (typeof window === 'undefined' || !hasLoadedSavedState.current) return;
    
    try {
      localStorage.setItem('lesson-learning-sidebar-state', String(showSidebar));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [showSidebar]);

  // Save right panel state to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (typeof window === 'undefined' || !hasLoadedSavedState.current) return;
    
    try {
      localStorage.setItem('lesson-learning-right-panel-state', String(showRightPanel));
    } catch (error) {
      console.warn('Failed to save right panel state to localStorage:', error);
    }
  }, [showRightPanel]);

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

    // Calculate video-specific time
    const videoTimeSpent = Math.floor((now - videoTimeRef.current.startTime) / 1000 / 60);
    // Use the maximum of video time or general lesson time
    const totalTimeSpent = Math.max(
      videoTimeSpent + (videoTimeRef.current.accumulatedTime || 0),
      lessonTimeRef.current.accumulatedTime + Math.floor((now - lessonTimeRef.current.startTime) / 1000 / 60)
    );
    
    const completionPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const isNearComplete = completionPercentage >= 95;

    trackLessonProgress({
      lessonId: currentLessonId,
      data: {
        timeSpent: totalTimeSpent,
        completed: isNearComplete,
        lastPosition: currentTime,
      },
    });
    
    // Update lesson time ref to keep it in sync
    lessonTimeRef.current.accumulatedTime = totalTimeSpent;
    lessonTimeRef.current.lastSaveTime = now;
  }, [currentLessonId, lesson?.videoUrl, trackLessonProgress]);

  // Handle video completion
  const handleVideoComplete = useCallback(() => {
    if (!currentLessonId) return;
    
    // Calculate actual time spent
    const now = Date.now();
    const timeSinceStart = Math.floor((now - lessonTimeRef.current.startTime) / 1000 / 60);
    const actualTimeSpent = timeSinceStart + lessonTimeRef.current.accumulatedTime;
    
    // Mark as complete with actual time spent
    trackLessonProgress({
      lessonId: currentLessonId,
      data: {
        timeSpent: actualTimeSpent,
        completed: true,
      },
    });
    
    toast.success(t('lessonCompleted', { defaultValue: 'Lesson completed!' }));
  }, [currentLessonId, trackLessonProgress, t]);

  // Initialize time tracking when lesson loads
  useEffect(() => {
    if (!currentLessonId) return;

    // Reset tracking refs
    videoTimeRef.current = { startTime: 0, accumulatedTime: 0 };
    lastPositionRef.current = 0;
    lessonTimeRef.current.startTime = Date.now();
    lessonTimeRef.current.lastSaveTime = Date.now();

    // Load existing time spent from progress
    if (currentLessonProgress) {
      const existingTime = currentLessonProgress.timeSpentMinutes || 0;
      lessonTimeRef.current.accumulatedTime = existingTime;
      if (lesson?.videoUrl) {
        videoTimeRef.current.accumulatedTime = existingTime;
      }
    }
  }, [currentLessonId, currentLessonProgress, lesson?.videoUrl]);

  // Auto-track time spent for all lessons (video and text)
  useEffect(() => {
    if (!currentLessonId || !lesson) return;

    // Track time every 30 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceStart = Math.floor((now - lessonTimeRef.current.startTime) / 1000 / 60);
      const totalTimeSpent = timeSinceStart + lessonTimeRef.current.accumulatedTime;

      // Only save if at least 1 minute has passed since last save
      const timeSinceLastSave = Math.floor((now - lessonTimeRef.current.lastSaveTime) / 1000 / 60);
      if (timeSinceLastSave >= 1) {
        trackLessonProgress({
          lessonId: currentLessonId,
          data: {
            timeSpent: totalTimeSpent,
            completed: false,
          },
        });
        lessonTimeRef.current.lastSaveTime = now;
      }
    }, 30000); // Check every 30 seconds

    // Save time when component unmounts or lesson changes
    return () => {
      clearInterval(interval);
      // Save final time before leaving (only if meaningful time was spent)
      const now = Date.now();
      const timeSinceStart = Math.floor((now - lessonTimeRef.current.startTime) / 1000 / 60);
      const totalTimeSpent = timeSinceStart + lessonTimeRef.current.accumulatedTime;
      
      // Only save if at least 30 seconds were spent
      if (totalTimeSpent > 0 && currentLessonId && timeSinceStart >= 0.5) {
        trackLessonProgress({
          lessonId: currentLessonId,
          data: {
            timeSpent: totalTimeSpent,
            completed: false,
          },
        });
      }
    };
  }, [currentLessonId, lesson, trackLessonProgress]);

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
    <div className="flex h-screen bg-white dark:bg-background overflow-hidden">
      {/* Left Sidebar - Udemy Style (Desktop) */}
      <div className={cn(
        'hidden lg:flex flex-col bg-white dark:bg-background border-r border-gray-200 dark:border-border transition-all duration-300 ease-in-out',
        showSidebar ? 'w-80' : 'w-0 overflow-hidden'
      )}>
        {/* Sidebar Header - Udemy Style */}
        <div className="h-16 border-b border-gray-200 dark:border-border flex items-center justify-between px-4 shrink-0 bg-white dark:bg-background">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-foreground truncate mb-0.5">{(course ).titleEn || course.title}</h3>
            <div className="flex items-center gap-2">
              <Progress value={progress?.progressPercentage || 0} className="h-1.5 w-20" />
              <span className="text-xs font-medium text-muted-foreground">
                {progress?.progressPercentage.toFixed(0) || 0}%
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setShowSidebar(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Course Content - Udemy Style */}
        <ScrollArea className="flex-1 bg-white dark:bg-background">
          <div className="p-2">
            {sectionsWithContent.map((section: any, sectionIndex: number) => {
              const isExpanded = expandedSections.has(section.id);
              const completedCount = section.lessons?.filter((l: any) => {
                const progress = lessonProgressMap[l.id];
                return progress?.isCompleted || l.completed;
              }).length || 0;
              const totalLessons = section.lessons?.length || 0;
              const sectionProgress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

              return (
                <div key={section.id} className="mb-1">
                  {/* Section Header - Udemy Style */}
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto font-medium hover:bg-gray-100 dark:hover:bg-muted rounded-none"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 text-start">
                      <div className="flex items-center gap-2 shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-bold text-muted-foreground w-4">
                          {sectionIndex + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {section.titleEn || section.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={sectionProgress} className="h-1 w-16" />
                          <span className="text-xs text-muted-foreground">
                            {completedCount}/{totalLessons}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Button>

                  {/* Section Content - Udemy Style */}
                  {isExpanded && (
                    <div className="pl-8 pr-2 rtl:pl-2 rtl:pr-8 space-y-0.5 mt-0.5">
                      {section.lessons?.map((lessonItem: any, lessonIndex: number) => {
                        const lessonProgress = lessonProgressMap[lessonItem.id];
                        const isCompleted = lessonProgress?.isCompleted || lessonItem.completed || false;
                        const isActive = currentLessonId === lessonItem.id;
                        
                        return (
                          <Button
                            key={lessonItem.id}
                            variant="ghost"
                            className={cn(
                              'w-full justify-start text-left h-auto py-2.5 px-3 rounded-none',
                              isActive 
                                ? 'bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-600 dark:border-l-blue-500 rtl:border-l-0 rtl:border-r-2 rtl:border-r-blue-600 dark:rtl:border-r-blue-500' 
                                : 'hover:bg-gray-50 dark:hover:bg-muted/50'
                            )}
                            onClick={() => navigateToLesson(lessonItem.id, lessonItem.sectionId)}
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="shrink-0 mt-0.5">
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {lessonItem.videoUrl ? (
                                    <PlayCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  ) : (
                                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  )}
                                  <p className={cn(
                                    'text-sm leading-snug line-clamp-2',
                                    isActive ? 'font-semibold text-foreground' : 'text-foreground'
                                  )}>
                                    {lessonItem.titleEn || lessonItem.title}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {lessonItem.durationMinutes && (
                                    <span className="text-xs text-muted-foreground">
                                      {lessonItem.durationMinutes} {t('min', { defaultValue: 'min' })}
                                    </span>
                                  )}
                                  {lessonProgress?.timeSpentMinutes > 0 && !isCompleted && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                                      {Math.floor(lessonProgress.timeSpentMinutes)}m
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
        {/* Top Bar - Udemy Style */}
        <div className="h-16 bg-white dark:bg-background border-b border-gray-200 dark:border-border flex items-center px-4 sm:px-6 gap-3 sm:gap-4 shrink-0">
          {/* Mobile Sidebar Toggle */}
          <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 shrink-0 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="h-16 border-b border-gray-200 dark:border-border flex items-center justify-between px-4 shrink-0">
                <div className="flex-1 min-w-0">
                  <SheetTitle className="font-bold text-sm text-foreground truncate mb-0.5">{(course ).titleEn || course.title}</SheetTitle>
                  <div className="flex items-center gap-2">
                    <Progress value={progress?.progressPercentage || 0} className="h-1.5 w-20" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {progress?.progressPercentage.toFixed(0) || 0}%
                    </span>
                  </div>
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1 bg-white dark:bg-background">
                <div className="p-2">
                  {sectionsWithContent.map((section: any, sectionIndex: number) => {
                    const isExpanded = expandedSections.has(section.id);
                    const completedCount = section.lessons?.filter((l: any) => {
                      const progress = lessonProgressMap[l.id];
                      return progress?.isCompleted || l.completed;
                    }).length || 0;
                    const totalLessons = section.lessons?.length || 0;
                    const sectionProgress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

                    return (
                      <div key={section.id} className="mb-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-3 h-auto font-medium hover:bg-gray-100 dark:hover:bg-muted rounded-none"
                          onClick={() => toggleSection(section.id)}
                        >
                          <div className="flex items-center gap-3 flex-1 text-start">
                            <div className="flex items-center gap-2 shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-xs font-bold text-muted-foreground w-4">
                                {sectionIndex + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-foreground truncate">
                                  {section.titleEn || section.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={sectionProgress} className="h-1 w-16" />
                                <span className="text-xs text-muted-foreground">
                                  {completedCount}/{totalLessons}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Button>
                        {isExpanded && (
                          <div className="pl-8 pr-2 rtl:pl-2 rtl:pr-8 space-y-0.5 mt-0.5">
                            {section.lessons?.map((lessonItem: any, lessonIndex: number) => {
                              const lessonProgress = lessonProgressMap[lessonItem.id];
                              const isCompleted = lessonProgress?.isCompleted || lessonItem.completed || false;
                              const isActive = currentLessonId === lessonItem.id;
                              
                              return (
                                <Button
                                  key={lessonItem.id}
                                  variant="ghost"
                                  className={cn(
                                    'w-full justify-start text-left h-auto py-2.5 px-3 rounded-none',
                                    isActive 
                                      ? 'bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-600 dark:border-l-blue-500 rtl:border-l-0 rtl:border-r-2 rtl:border-r-blue-600 dark:rtl:border-r-blue-500' 
                                      : 'hover:bg-gray-50 dark:hover:bg-muted/50'
                                  )}
                                  onClick={() => {
                                    navigateToLesson(lessonItem.id, lessonItem.sectionId);
                                    setShowSidebar(false);
                                  }}
                                >
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="shrink-0 mt-0.5">
                                      {isCompleted ? (
                                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        {lessonItem.videoUrl ? (
                                          <PlayCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        ) : (
                                          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        )}
                                        <p className={cn(
                                          'text-sm leading-snug line-clamp-2',
                                          isActive ? 'font-semibold text-foreground' : 'text-foreground'
                                        )}>
                                          {lessonItem.titleEn || lessonItem.title}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        {lessonItem.durationMinutes && (
                                          <span className="text-xs text-muted-foreground">
                                            {lessonItem.durationMinutes} {t('min', { defaultValue: 'min' })}
                                          </span>
                                        )}
                                        {lessonProgress?.timeSpentMinutes > 0 && !isCompleted && (
                                          <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                                            {Math.floor(lessonProgress.timeSpentMinutes)}m
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
            </SheetContent>
          </Sheet>

          {/* Desktop Sidebar Toggle */}
          {!showSidebar && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 shrink-0 hidden lg:flex"
              onClick={() => setShowSidebar(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm sm:text-base text-foreground truncate">{lesson.titleEn || lesson.title}</h2>
            <p className="text-xs text-muted-foreground truncate mt-0.5 hidden sm:block">
              {(course ).titleEn || course.title}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {progress && (
              <div className="hidden sm:flex items-center gap-2">
                <Progress value={progress.progressPercentage} className="w-24 sm:w-28 h-2" />
                <span className="text-xs font-medium text-muted-foreground min-w-12 hidden md:inline">
                  {progress.progressPercentage.toFixed(0)}% {t('complete', { defaultValue: 'complete' })}
                </span>
              </div>
            )}
            {/* Mobile Right Panel Toggle */}
            <Sheet open={showRightPanel} onOpenChange={setShowRightPanel}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 lg:hidden"
                >
                  <BookOpen className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="h-16 border-b border-gray-200 dark:border-border flex items-center justify-between px-4 shrink-0">
                  <SheetTitle className="font-bold text-sm text-foreground">{t('resources', { defaultValue: 'Resources' })}</SheetTitle>
                </SheetHeader>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v )} className="flex-1 flex flex-col h-full">
                  <TabsList className="grid w-full grid-cols-3 mx-4 mt-3 h-10 bg-gray-100 dark:bg-muted">
                    <TabsTrigger 
                      value="notes" 
                      className="text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <BookOpen className="h-3.5 w-3.5 me-1.5" />
                      {t('notes', { defaultValue: 'Notes' })}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="discussions" 
                      className="text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <MessageSquare className="h-3.5 w-3.5 me-1.5" />
                      {t('discussions', { defaultValue: 'Discussions' })}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="resources" 
                      className="text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5 me-1.5" />
                      {t('resources', { defaultValue: 'Resources' })}
                    </TabsTrigger>
                  </TabsList>
                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      <TabsContent value="notes" className="mt-4">
                        <Notes entityType="lesson" entityId={currentLessonId} />
                      </TabsContent>
                      <TabsContent value="discussions" className="mt-4">
                        {lessonThreads && lessonThreads.length > 0 ? (
                          <div className="space-y-3">
                            {lessonThreads.map((thread: any) => (
                              <Card key={thread.id} className="p-3 border border-gray-200 dark:border-border hover:shadow-sm transition-shadow cursor-pointer">
                                <div className="flex items-start gap-3">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                  <p className="text-sm font-medium text-foreground line-clamp-2">{thread.title}</p>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                            <p className="text-sm text-muted-foreground">
                              {t('noDiscussions', { defaultValue: 'No discussions yet' })}
                            </p>
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="resources" className="mt-4">
                        {lessonResources && lessonResources.length > 0 ? (
                          <div className="space-y-2">
                            {lessonResources.map((resource: any) => (
                              <Card key={resource.id} className="p-3 border border-gray-200 dark:border-border hover:shadow-sm transition-shadow">
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start h-auto p-0 hover:bg-transparent"
                                  asChild
                                >
                                  <a href={resource.fileUrl} download className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20 shrink-0">
                                      <Download className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground text-left flex-1">
                                      {resource.titleEn || resource.title}
                                    </span>
                                  </a>
                                </Button>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Download className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                            <p className="text-sm text-muted-foreground">
                              {t('noResources', { defaultValue: 'No resources available' })}
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </div>
                  </ScrollArea>
                </Tabs>
              </SheetContent>
            </Sheet>

            {/* Desktop Right Panel Toggle */}
            {!showRightPanel && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 hidden lg:flex"
                onClick={() => setShowRightPanel(true)}
              >
                <BookOpen className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Video/Content Player Area - Udemy Style */}
        <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
          {lesson.videoUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <LinkedInVideoPlayer
                src={lesson.videoUrl}
                poster={(course ).thumbnailUrl || (course ).thumbnail}
                chapters={[]}
                transcript={[]}
                className="w-full h-full max-w-full"
                onProgress={saveVideoProgress}
                onComplete={handleVideoComplete}
                autoPlay={false}
              />
            </div>
          ) : (
            <Card className="m-4 sm:m-8 p-6 sm:p-8 bg-background max-w-4xl max-h-full overflow-auto border border-gray-200 dark:border-border">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <h1 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">{lesson.titleEn || lesson.title}</h1>
                {lesson.descriptionEn && (
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">{lesson.descriptionEn}</p>
                )}
                {lesson.attachmentUrl && (
                  <div className="mb-4">
                    <Button variant="outline" size="lg" asChild>
                      <a href={lesson.attachmentUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 me-2" />
                        {t('downloadAttachment', { defaultValue: 'Download Attachment' })}
                      </a>
                    </Button>
                  </div>
                )}
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ 
                    __html: lesson.contentEn || lesson.content || t('noContent', { defaultValue: 'Lesson content will appear here.' })
                  }}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Bottom Navigation Bar - Udemy Style */}
        <div className="h-20 bg-white dark:bg-background border-t border-gray-200 dark:border-border flex items-center justify-between px-4 sm:px-6 shrink-0 gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={navigatePrevious}
            disabled={!hasPrevious}
            className="gap-2 h-11 min-w-[100px] sm:min-w-[120px] text-sm sm:text-base"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('previous', { defaultValue: 'Previous' })}</span>
            <span className="sm:hidden">Prev</span>
          </Button>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isLessonCompleted && (
              <Button
                size="lg"
                variant="outline"
                onClick={async () => {
                  // Calculate actual time spent
                  const now = Date.now();
                  const timeSinceStart = Math.floor((now - lessonTimeRef.current.startTime) / 1000 / 60);
                  const actualTimeSpent = timeSinceStart + lessonTimeRef.current.accumulatedTime;
                  
                  // Optimistically update the UI
                  setLessonProgressMap(prev => ({
                    ...prev,
                    [currentLessonId]: {
                      ...prev[currentLessonId],
                      lessonId: currentLessonId,
                      enrollmentId: progress?.enrollmentId || 0,
                      isCompleted: true,
                      completedAt: new Date(),
                      timeSpentMinutes: actualTimeSpent,
                      lastAccessedAt: new Date(),
                    },
                  }));
                  
                  // Mark as complete with actual time spent
                  trackLessonProgress({
                    lessonId: currentLessonId,
                    data: {
                      timeSpent: actualTimeSpent,
                      completed: true,
                    },
                  });
                  
                  toast.success(t('lessonMarkedComplete', { defaultValue: 'Lesson marked as complete!' }));
                }}
                className="gap-2 h-11 text-sm sm:text-base px-3 sm:px-4"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t('markComplete', { defaultValue: 'Mark as complete' })}</span>
                <span className="sm:hidden">Complete</span>
              </Button>
            )}
            {isLessonCompleted && (
              <Badge variant="default" className="gap-2 px-3 py-1.5 h-11 flex items-center text-sm">
                <CheckCircle className="h-4 w-4" />
                {t('completed', { defaultValue: 'Completed' })}
              </Badge>
            )}
          </div>

          <Button
            variant="default"
            size="lg"
            onClick={navigateNext}
            disabled={!hasNext}
            className="gap-2 h-11 min-w-[100px] sm:min-w-[120px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-sm sm:text-base"
          >
            <span className="hidden sm:inline">{t('next', { defaultValue: 'Next' })}</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Panel - Notes, Discussions, Resources - Udemy Style */}
      <div className={cn(
        'hidden lg:flex flex-col bg-white dark:bg-background border-l border-gray-200 dark:border-border transition-all duration-300 ease-in-out',
        showRightPanel ? 'w-80' : 'w-0 overflow-hidden'
      )}>
        <div className="h-16 border-b border-gray-200 dark:border-border flex items-center justify-between px-4 shrink-0">
          <h3 className="font-bold text-sm text-foreground">{t('resources', { defaultValue: 'Resources' })}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setShowRightPanel(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v )} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-3 h-10 bg-gray-100 dark:bg-muted">
            <TabsTrigger 
              value="notes" 
              className="text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <BookOpen className="h-3.5 w-3.5 me-1.5" />
              {t('notes', { defaultValue: 'Notes' })}
            </TabsTrigger>
            <TabsTrigger 
              value="discussions" 
              className="text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <MessageSquare className="h-3.5 w-3.5 me-1.5" />
              {t('discussions', { defaultValue: 'Discussions' })}
            </TabsTrigger>
            <TabsTrigger 
              value="resources" 
              className="text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Download className="h-3.5 w-3.5 me-1.5" />
              {t('resources', { defaultValue: 'Resources' })}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <TabsContent value="notes" className="mt-4">
                <Notes entityType="lesson" entityId={currentLessonId} />
              </TabsContent>
              <TabsContent value="discussions" className="mt-4">
                {lessonThreads && lessonThreads.length > 0 ? (
                  <div className="space-y-3">
                    {lessonThreads.map((thread: any) => (
                      <Card key={thread.id} className="p-3 border border-gray-200 dark:border-border hover:shadow-sm transition-shadow cursor-pointer">
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-foreground line-clamp-2">{thread.title}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      {t('noDiscussions', { defaultValue: 'No discussions yet' })}
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="resources" className="mt-4">
                {lessonResources && lessonResources.length > 0 ? (
                  <div className="space-y-2">
                    {lessonResources.map((resource: any) => (
                      <Card key={resource.id} className="p-3 border border-gray-200 dark:border-border hover:shadow-sm transition-shadow">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-auto p-0 hover:bg-transparent"
                          asChild
                        >
                          <a href={resource.fileUrl} download className="flex items-center gap-3">
                            <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20 shrink-0">
                              <Download className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                            </div>
                            <span className="text-sm font-medium text-foreground text-left flex-1">
                              {resource.titleEn || resource.title}
                            </span>
                          </a>
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Download className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      {t('noResources', { defaultValue: 'No resources available' })}
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
