'use client';

import { useState, use } from 'react';
import { useCourse } from '@/lib/hooks/use-api';
import { PageLoader } from '@/components/loading/page-loader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notes } from '@/components/shared/notes';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, FileText, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: course, isLoading } = useCourse(parseInt(id));
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [showNotes, setShowNotes] = useState(true);

  if (isLoading) {
    return <PageLoader message="Loading course..." />;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  // Flatten all lessons from sections
  const allLessons = course.sections?.flatMap((section: any) => 
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

  return (
    <div className="fixed inset-0 top-16 flex">
      {/* Lesson Sidebar */}
      <div className="w-80 border-r bg-background hidden lg:block">
        <div className="p-4 border-b">
          <h2 className="font-semibold line-clamp-2">{course.title}</h2>
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Course Progress</span>
              <span>{course.progress || 0}%</span>
            </div>
            <Progress value={course.progress || 0} className="h-2" />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-4">
            {course.sections?.map((section: any) => (
              <div key={section.id}>
                <h3 className="font-semibold text-sm mb-2">{section.title}</h3>
                <ul className="space-y-1">
                  {section.lessons?.map((lesson: any) => (
                    <li key={lesson.id}>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start text-left h-auto py-2',
                          currentLesson?.id === lesson.id && 'bg-accent'
                        )}
                        onClick={() => setActiveLesson(lesson)}
                      >
                        <div className="flex items-start gap-2 flex-1">
                          {lesson.completed ? (
                            <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-clamp-2">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.duration} min
                            </p>
                          </div>
                          {lesson.type === 'video' ? (
                            <PlayCircle className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 flex-shrink-0" />
                          )}
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">{currentLesson?.sectionTitle}</p>
                <h1 className="text-2xl font-bold mt-1">{currentLesson?.title}</h1>
              </div>

              {/* Video/Content Player */}
              {currentLesson?.type === 'video' ? (
                <Card className="aspect-video bg-black flex items-center justify-center mb-6">
                  <PlayCircle className="w-16 h-16 text-white" />
                  <p className="text-white ml-4">Video Player Placeholder</p>
                </Card>
              ) : (
                <Card className="p-6 mb-6">
                  <div className="prose max-w-none">
                    <p>{currentLesson?.content || 'Lesson content will appear here.'}</p>
                  </div>
                </Card>
              )}

              {/* Lesson Description */}
              {currentLesson?.description && (
                <Card className="p-6 mb-6">
                  <h3 className="font-semibold mb-2">About this lesson</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentLesson.description}
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t p-4 bg-background">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Complete
            </Button>

            <Button onClick={handleNext} disabled={!hasNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Notes Sidebar */}
      {showNotes && (
        <div className="w-96 border-l bg-background hidden xl:block">
          <div className="p-4 h-full overflow-auto">
            <Notes entityType="lesson" entityId={currentLesson?.id} />
          </div>
        </div>
      )}
    </div>
  );
}
