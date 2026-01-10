'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, HelpCircle, Calendar, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { PendingAssignment, PendingQuiz } from '@leap-lms/shared-types';

interface PendingTasksCardProps {
  assignments: PendingAssignment[];
  quizzes: PendingQuiz[];
}

export function PendingTasksCard({ assignments, quizzes }: PendingTasksCardProps) {
  const hasTasks = assignments.length > 0 || quizzes.length > 0;

  const getDaysUntilDue = (dueDate?: Date) => {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getUrgencyColor = (days: number | null) => {
    if (days === null) return 'default';
    if (days <= 1) return 'destructive';
    if (days <= 3) return 'secondary';
    return 'default';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Pending Tasks
        </CardTitle>
        <CardDescription>
          {hasTasks 
            ? `You have ${assignments.length + quizzes.length} pending task(s)` 
            : 'You\'re all caught up!'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasTasks ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No pending tasks. Great job!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.slice(0, 3).map((assignment) => {
              const daysUntilDue = getDaysUntilDue(assignment.dueDate);
              return (
                <div
                  key={assignment.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex gap-3 flex-1">
                    <div className="bg-blue-100 p-2 rounded-lg h-fit">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm">{assignment.assignmentTitle}</p>
                      <p className="text-xs text-muted-foreground">{assignment.courseName}</p>
                      {assignment.dueDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Due {daysUntilDue !== null && daysUntilDue >= 0 
                              ? `in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
                              : 'overdue'}
                          </span>
                          {daysUntilDue !== null && daysUntilDue < 3 && (
                            <Badge variant={getUrgencyColor(daysUntilDue)} className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Link href={`/hub/courses/${assignment.courseId}`}>
                    <Button size="sm" variant="outline">Start</Button>
                  </Link>
                </div>
              );
            })}

            {quizzes.slice(0, 3).map((quiz) => {
              const daysUntilDue = getDaysUntilDue(quiz.dueDate);
              return (
                <div
                  key={quiz.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex gap-3 flex-1">
                    <div className="bg-purple-100 p-2 rounded-lg h-fit">
                      <HelpCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm">{quiz.quizTitle}</p>
                      <p className="text-xs text-muted-foreground">{quiz.courseName}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {quiz.totalQuestions} questions
                        </Badge>
                        {quiz.attemptsRemaining && (
                          <Badge variant="secondary" className="text-xs">
                            {quiz.attemptsRemaining} attempt(s) left
                          </Badge>
                        )}
                        {quiz.dueDate && daysUntilDue !== null && daysUntilDue < 3 && (
                          <Badge variant={getUrgencyColor(daysUntilDue)} className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link href={`/hub/courses/${quiz.courseId}`}>
                    <Button size="sm" variant="outline">Start</Button>
                  </Link>
                </div>
              );
            })}

            {(assignments.length + quizzes.length) > 6 && (
              <Button variant="ghost" className="w-full mt-2">
                View all tasks ({assignments.length + quizzes.length})
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
