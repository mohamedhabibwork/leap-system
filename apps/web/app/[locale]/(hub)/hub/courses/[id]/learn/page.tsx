'use client';

import { useState, use } from 'react';
import { useCourse } from '@/lib/hooks/use-api';
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
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

export default function CourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('courses.learning');
  const { id } = use(params);
  const { data: course, isLoading } = useCourse(parseInt(id));
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'qa'>('notes');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

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
              <span className="font-bold text-primary">{(course as any).progress || 0}%</span>
            </div>
            <Progress value={(course as any).progress || 0} className="h-1.5" />
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
            <p className="text-xs text-muted-foreground truncate">
              {currentLesson?.sectionTitle}
            </p>
            <h2 className="font-semibold truncate">{currentLesson?.title}</h2>
          </div>
          <Badge variant="outline">
            {currentIndex + 1} / {allLessons.length}
          </Badge>
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

            <Button 
              variant={currentLesson?.completed ? 'outline' : 'default'}
              size="lg"
              className="min-w-48"
            >
              {currentLesson?.completed ? (
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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'notes' | 'qa')} className="flex-1 flex flex-col">
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none bg-transparent h-14 px-4">
              <TabsTrigger value="notes" className="gap-2">
                <BookOpen className="h-4 w-4" />
                {t('notes', { defaultValue: 'Notes' })}
              </TabsTrigger>
              <TabsTrigger value="qa" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                {t('qa', { defaultValue: 'Q&A' })}
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
          <TabsContent value="qa" className="flex-1 overflow-auto m-0">
            <div className="p-4">
              <p className="text-sm text-muted-foreground text-center py-8">
                {t('qaComingSoon', { defaultValue: 'Q&A section coming soon' })}
              </p>
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
