'use client';

import { useState, use, useEffect } from 'react';
import { useCourse } from '@/lib/hooks/use-api';
import { useCourseProgress } from '@/hooks/use-course-progress';
import { useLessonThreads } from '@/hooks/use-discussions';
import { useLessonResources } from '@/lib/hooks/use-resources-api';
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
  Loader2,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { useRouter } from '@/i18n/navigation';

export default function CourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('courses.learning');
  const router = useRouter();
  const { id } = use(params);
  const courseId = parseInt(id);
  const { data: course, isLoading } = useCourse(courseId);
  const { progress, completeLesson, isTracking } = useCourseProgress(courseId);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'discussions' | 'resources'>('notes');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  // Fetch discussions for current lesson
  const { data: lessonThreads } = useLessonThreads(activeLesson?.id || 0, {
    enabled: !!activeLesson?.id && activeTab === 'discussions',
  });

  // Fetch resources for current lesson
  const { data: lessonResources } = useLessonResources(
    activeLesson?.id || 0,
    !!activeLesson?.id && activeTab === 'resources'
  );

  // Track progress when lesson changes
  useEffect(() => {
    if (activeLesson?.id) {
      // Auto-track lesson view
      // This could be done via a debounced API call
    }
  }, [activeLesson?.id]);

  if (isLoading) {
    return <PageLoader message="Loading course..." />;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  // Flatten all lessons from sections
  const allLessons = (course as any).sections?.flatMap((section: any) => 
    section.lessons?.map((lesson: any) => ({ ...lesson, sectionTitle: section.title }))
  ) || [];

  const currentLesson = activeLesson || allLessons[0];
  const currentIndex = allLessons.findIndex((l: any) => l.id === currentLesson?.id);
  const hasNext = currentIndex < allLessons.length - 1;
  const hasPrevious = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) {
      setActiveLesson(allLessons[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      setActiveLesson(allLessons[currentIndex - 1]);
    }
  };

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="fixed inset-0 top-0 flex bg-black">
      {/* Lesson Sidebar - Collapsible */}
      <div className={cn(
        'border-e bg-background transition-all duration-300 flex flex-col',
        showSidebar ? 'w-80' : 'w-0 overflow-hidden'
      )}>
        {/* Header */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg line-clamp-1">{(course as any).title}</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSidebar(false)}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="font-medium">
                {t('courseProgress', { defaultValue: 'Course Progress' })}
              </span>
              <span className="font-bold text-primary">
                {progress?.progressPercentage || (course as any).progress || 0}%
              </span>
            </div>
            <Progress value={progress?.progressPercentage || (course as any).progress || 0} className="h-1.5" />
          </div>
        </div>

        {/* Lessons List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {(course as any).sections?.map((section: any, sectionIndex: number) => {
              const isExpanded = expandedSections.has(section.id);
              const completedCount = section.lessons?.filter((l: any) => l.completed).length || 0;
              const totalCount = section.lessons?.length || 0;

              return (
                <div key={section.id} className="mb-1">
                  {/* Section Header */}
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto font-semibold hover:bg-accent"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 text-start">
                      <span className="text-xs font-bold text-muted-foreground">
                        {sectionIndex + 1}
                      </span>
                      <span className="text-sm line-clamp-1">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {completedCount}/{totalCount}
                      </Badge>
                      <ChevronDown className={cn(
                        'h-4 w-4 transition-transform',
                        isExpanded && 'rotate-180'
                      )} />
                    </div>
                  </Button>

                  {/* Lessons in Section */}
                  {isExpanded && (
                    <div className="ps-6 rtl:ps-0 rtl:pe-6 space-y-0.5 mt-0.5">
                      {section.lessons?.map((lesson: any, lessonIndex: number) => (
                        <Button
                          key={lesson.id}
                          variant="ghost"
                          className={cn(
                            'w-full justify-start text-left h-auto py-2.5 px-3',
                            currentLesson?.id === lesson.id && 'bg-accent border border-primary'
                          )}
                          onClick={() => setActiveLesson(lesson)}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="shrink-0 mt-0.5">
                              {lesson.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground font-medium">
                                  {sectionIndex + 1}.{lessonIndex + 1}
                                </span>
                                {lesson.type === 'video' ? (
                                  <PlayCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                              </div>
                              <p className="text-sm line-clamp-2 leading-snug">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {lesson.duration} min
                              </p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-black">
        {/* Top Bar */}
        <div className="h-14 bg-background border-b flex items-center px-4 gap-4">
          {!showSidebar && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSidebar(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-muted-foreground truncate">
                {currentLesson?.sectionTitle}
              </p>
              {progress && (
                <Badge variant="outline" className="text-xs">
                  {progress.progressPercentage.toFixed(0)}% {t('complete', { defaultValue: 'Complete' })}
                </Badge>
              )}
            </div>
            <h2 className="font-semibold truncate">{currentLesson?.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {progress && (
              <div className="w-24 hidden sm:block">
                <Progress value={progress.progressPercentage} className="h-2" />
              </div>
            )}
            <Badge variant="outline">
              {currentIndex + 1} / {allLessons.length}
            </Badge>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-7xl">
            {currentLesson?.type === 'video' ? (
              <LinkedInVideoPlayer
                src={currentLesson.videoUrl || ''}
                poster={(course as any).thumbnail}
                chapters={[]}
                transcript={[]}
                className="w-full"
              />
            ) : (
              <Card className="p-8 bg-background">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <h1>{currentLesson?.title}</h1>
                  <p>{currentLesson?.content || 'Lesson content will appear here.'}</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="h-20 border-t bg-background/95 backdrop-blur">
          <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="min-w-32"
            >
              <ChevronLeft className="me-2 h-4 w-4 rtl:rotate-180" />
              {t('previous', { defaultValue: 'Previous' })}
            </Button>

            <div className="flex flex-col items-center gap-2">
              <Button 
                variant={currentLesson?.completed ? 'outline' : 'default'}
                size="lg"
                className="min-w-48"
                onClick={() => {
                  if (!currentLesson?.completed && currentLesson?.id) {
                    completeLesson(courseId, currentLesson.id);
                  }
                }}
                disabled={isTracking || currentLesson?.completed}
              >
                {isTracking ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t('saving', { defaultValue: 'Saving...' })}
                  </>
                ) : currentLesson?.completed ? (
                  <>
                    <CheckCircle className="me-2 h-4 w-4 text-green-600" />
                    {t('completed', { defaultValue: 'Completed' })}
                  </>
                ) : (
                  <>
                    <CheckCircle className="me-2 h-4 w-4" />
                    {t('markComplete', { defaultValue: 'Mark as complete' })}
                  </>
                )}
              </Button>
              {progress && progress.progressPercentage === 100 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => router.push(`/hub/courses/${courseId}/certificate`)}
                  className="text-xs"
                >
                  <Award className="h-3 w-3 mr-1" />
                  {t('downloadCertificate', { defaultValue: 'Download Certificate' })}
                </Button>
              )}
            </div>

            <Button 
              onClick={handleNext} 
              disabled={!hasNext}
              size="lg"
              className="min-w-32"
            >
              {t('next', { defaultValue: 'Next' })}
              <ChevronRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Notes & Q&A */}
      <div className={cn(
        'border-s bg-background transition-all duration-300 flex flex-col',
        showRightPanel ? 'w-96' : 'w-0 overflow-hidden'
      )}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'notes' | 'discussions' | 'resources')} className="flex-1 flex flex-col">
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none bg-transparent h-14 px-4">
              <TabsTrigger value="notes" className="gap-2">
                <BookOpen className="h-4 w-4" />
                {t('notes', { defaultValue: 'Notes' })}
              </TabsTrigger>
              <TabsTrigger value="discussions" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                {t('discussions', { defaultValue: 'Discussions' })}
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-2">
                <FileText className="h-4 w-4" />
                {t('resources', { defaultValue: 'Resources' })}
              </TabsTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRightPanel(false)}
                className="ms-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </TabsList>
          </div>
          <TabsContent value="notes" className="flex-1 overflow-auto m-0">
            <div className="p-4">
              <Notes entityType="lesson" entityId={currentLesson?.id} />
            </div>
          </TabsContent>
          <TabsContent value="discussions" className="flex-1 overflow-auto m-0">
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">{t('lessonDiscussions', { defaultValue: 'Lesson Discussions' })}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/hub/courses/${courseId}/discussions`)}
                >
                  {t('viewAll', { defaultValue: 'View All' })}
                </Button>
              </div>
              {lessonThreads && lessonThreads.length > 0 ? (
                <div className="space-y-3">
                  {lessonThreads.slice(0, 5).map((thread: any) => (
                    <Card key={thread.id} className="p-3">
                      <h4 className="font-medium text-sm mb-1">{thread.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{thread.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{thread.repliesCount} {t('replies', { defaultValue: 'replies' })}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('noDiscussions', { defaultValue: 'No discussions yet. Start one!' })}
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="resources" className="flex-1 overflow-auto m-0">
            <div className="p-4">
              <h3 className="font-semibold mb-4">{t('lessonResources', { defaultValue: 'Lesson Resources' })}</h3>
              {lessonResources && lessonResources.length > 0 ? (
                <div className="space-y-2">
                  {lessonResources.map((resource: any) => (
                    <Card key={resource.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{resource.titleEn}</p>
                            {resource.descriptionEn && (
                              <p className="text-xs text-muted-foreground">{resource.descriptionEn}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                            window.open(`${API_URL}/api/v1/lms/resources/${resource.id}/download`, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('noResources', { defaultValue: 'No resources available for this lesson' })}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Toggle Right Panel Button (when hidden) */}
      {!showRightPanel && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowRightPanel(true)}
          className="absolute top-20 end-4 z-10"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
