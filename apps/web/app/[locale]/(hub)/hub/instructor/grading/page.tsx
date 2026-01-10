'use client';

import { useState } from 'react';
import { usePendingAssignments, useQuizAttempts } from '@/lib/hooks/use-instructor-api';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, ClipboardCheck, ExternalLink } from 'lucide-react';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { format } from 'date-fns';
import { Link } from '@/i18n/navigation';

export default function InstructorGradingPage() {
  const [activeTab, setActiveTab] = useState<'assignments' | 'quizzes'>('assignments');
  const { data: pendingAssignments, isLoading: isLoadingAssignments } = usePendingAssignments();
  const { data: quizAttempts, isLoading: isLoadingQuizzes } = useQuizAttempts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grading</h1>
        <p className="text-muted-foreground mt-2">
          Review and grade student submissions
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'assignments' | 'quizzes')}>
        <TabsList>
          <TabsTrigger value="assignments">
            <FileText className="h-4 w-4 mr-2" />
            Assignments
            {pendingAssignments && pendingAssignments.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                {pendingAssignments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Quizzes
          </TabsTrigger>
        </TabsList>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          {isLoadingAssignments ? (
            <div className="space-y-4">
              <CardSkeleton count={5} />
            </div>
          ) : pendingAssignments && pendingAssignments.length > 0 ? (
            <div className="space-y-4">
              {pendingAssignments.map((submission) => (
                <Card key={submission.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">{submission.assignmentTitle}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {submission.courseName}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Student</p>
                          <p className="font-medium">{submission.userName}</p>
                          <p className="text-muted-foreground text-xs">{submission.userEmail}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p className="font-medium">
                            {format(new Date(submission.submittedAt), 'PPp')}
                          </p>
                        </div>
                      </div>
                      {submission.submissionText && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm line-clamp-3">{submission.submissionText}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Link href={`/hub/instructor/grading/assignments/${submission.id}`}>
                        <Button size="sm">
                          Grade
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </Link>
                      {submission.fileUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                            View File
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">No pending assignments</p>
            </div>
          )}
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes" className="space-y-4">
          {isLoadingQuizzes ? (
            <div className="space-y-4">
              <CardSkeleton count={5} />
            </div>
          ) : quizAttempts && quizAttempts.length > 0 ? (
            <div className="space-y-4">
              {quizAttempts.map((attempt) => (
                <Card key={attempt.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">{attempt.quizTitle}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {attempt.courseName}
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Student</p>
                          <p className="font-medium">{attempt.userName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Score</p>
                          <p className="font-medium">
                            {attempt.score} / {attempt.maxScore}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium">
                            {attempt.isPassed ? '✓ Passed' : '✗ Failed'}
                          </p>
                        </div>
                      </div>
                      {attempt.completedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Completed: {format(new Date(attempt.completedAt), 'PPp')}
                        </p>
                      )}
                    </div>
                    <Link href={`/hub/instructor/grading/quizzes/${attempt.id}`}>
                      <Button size="sm">
                        Review
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">No quiz attempts</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
