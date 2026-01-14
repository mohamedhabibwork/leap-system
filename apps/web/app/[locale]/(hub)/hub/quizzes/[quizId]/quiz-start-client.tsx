'use client';

import { useState } from 'react';
import { useQuiz, useStartQuiz } from '@/lib/hooks/use-quiz-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, FileQuestion, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface QuizStartClientProps {
  quizId: number;
}

export function QuizStartClient({ quizId }: QuizStartClientProps) {
  const router = useRouter();
  const { data: quiz, isLoading } = useQuiz(quizId);
  const startQuiz = useStartQuiz();
  const [error, setError] = useState<string | null>(null);

  const handleStartQuiz = async () => {
    try {
      setError(null);
      const result = await startQuiz.mutateAsync(quizId);
      router.push(`/hub/quizzes/${quizId}/take`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start quiz. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="p-8">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-6" />
          <Skeleton className="h-10 w-32" />
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Quiz not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="p-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileQuestion className="w-6 h-6 text-blue-600" />
              <Badge variant="secondary">Quiz</Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.titleEn}</h1>
            {quiz.descriptionEn && (
              <p className="text-gray-600">{quiz.descriptionEn}</p>
            )}
          </div>

          {/* Quiz Info */}
          <div className="grid md:grid-cols-2 gap-4">
            {quiz.timeLimitMinutes && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Time Limit</p>
                  <p className="text-lg font-bold text-blue-900">{quiz.timeLimitMinutes} minutes</p>
                </div>
              </div>
            )}
            
            {quiz.maxAttempts && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <FileQuestion className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Max Attempts</p>
                  <p className="text-lg font-bold text-purple-900">{quiz.maxAttempts}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Passing Score</p>
                <p className="text-lg font-bold text-green-900">{quiz.passingScore}%</p>
              </div>
            </div>
          </div>

          {/* Availability */}
          {(quiz.availableFrom || quiz.availableUntil) && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Availability</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {quiz.availableFrom && (
                  <p>Available from: {format(new Date(quiz.availableFrom), 'PPP')}</p>
                )}
                {quiz.availableUntil && (
                  <p>Available until: {format(new Date(quiz.availableUntil), 'PPP')}</p>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Instructions</h3>
            <ul className="space-y-1 text-sm text-yellow-800 list-disc list-inside">
              <li>Read each question carefully before answering</li>
              {quiz.timeLimitMinutes && (
                <li>You have {quiz.timeLimitMinutes} minutes to complete this quiz</li>
              )}
              <li>You need to score at least {quiz.passingScore}% to pass</li>
              {quiz.shuffleQuestions && <li>Questions will be presented in random order</li>}
              {quiz.showCorrectAnswers && <li>You will see correct answers after submission</li>}
              <li>Make sure you have a stable internet connection</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Start Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartQuiz}
              disabled={startQuiz.isPending}
              className="flex-1"
              size="lg"
            >
              {startQuiz.isPending ? 'Starting...' : 'Start Quiz'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
