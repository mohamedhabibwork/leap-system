'use client';

import { useMyQuizAttempts } from '@/lib/hooks/use-quiz-api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileQuestion, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export function QuizzesListClient() {
  const { data: attempts, isLoading } = useMyQuizAttempts();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Quizzes</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!attempts || attempts.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Quizzes</h1>
        <Card className="p-12 text-center">
          <FileQuestion className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Quiz Attempts Yet</h2>
          <p className="text-gray-500">
            You haven't attempted any quizzes yet. Check your courses for available quizzes.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Quizzes</h1>
        <p className="text-gray-600">View your quiz attempts and results</p>
      </div>

      <div className="grid gap-4">
        {attempts.map((attempt) => (
          <Card key={attempt.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {attempt.quizTitleEn}
                  </h3>
                  {attempt.completedAt && (
                    <Badge
                      variant={attempt.isPassed ? 'default' : 'destructive'}
                      className={attempt.isPassed ? 'bg-green-600' : ''}
                    >
                      {attempt.isPassed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Passed
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Failed
                        </>
                      )}
                    </Badge>
                  )}
                  {!attempt.completedAt && (
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      In Progress
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>Attempt #{attempt.attemptNumber}</p>
                  {attempt.completedAt && attempt.score !== null && (
                    <p>
                      Score: <span className="font-semibold">{attempt.score}/{attempt.maxScore}</span> (
                      {Math.round((attempt.score / attempt.maxScore) * 100)}%)
                    </p>
                  )}
                  <p>Started: {format(new Date(attempt.startedAt), 'PPp')}</p>
                  {attempt.completedAt && (
                    <p>Completed: {format(new Date(attempt.completedAt), 'PPp')}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {attempt.completedAt ? (
                  <Button asChild>
                    <Link href={`/hub/quizzes/attempts/${attempt.id}/result`}>
                      View Results
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={`/hub/quizzes/${attempt.quizId}/take`}>
                      Continue
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
