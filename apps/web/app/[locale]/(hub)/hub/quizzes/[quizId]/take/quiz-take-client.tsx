'use client';

import { useState, useEffect } from 'react';
import { useQuizQuestions, useSubmitQuiz } from '@/lib/hooks/use-quiz-api';
import { QuizQuestion } from '@/components/quiz/quiz-question';
import { QuizTimer } from '@/components/quiz/quiz-timer';
import { QuizProgress } from '@/components/quiz/quiz-progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface QuizTakeClientProps {
  quizId: number;
}

interface Answer {
  questionId: number;
  selectedOptionId?: number;
  answerText?: string;
}

export function QuizTakeClient({ quizId }: QuizTakeClientProps) {
  const router = useRouter();
  const { data, isLoading, error } = useQuizQuestions(quizId);
  const submitQuiz = useSubmitQuiz();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const questions = data?.questions || [];
  const attemptId = data?.attemptId;
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (questionId: number, answer: Answer) => {
    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, answer);
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;

    try {
      setSubmitError(null);
      const answersArray = Array.from(answers.values());
      
      const result = await submitQuiz.mutateAsync({
        attemptId,
        answers: answersArray,
      });

      // Navigate to results page
      router.push(`/hub/quizzes/attempts/${attemptId}/result`);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit quiz. Please try again.');
    }
  };

  const handleTimeUp = () => {
    // Auto-submit when time is up
    setShowSubmitDialog(true);
    setTimeout(() => {
      handleSubmit();
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load quiz. Please start the quiz again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>This quiz has no questions.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const answeredCount = answers.size;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="space-y-4">
        {/* Top Bar with Timer and Progress */}
        <div className="grid md:grid-cols-2 gap-4">
          {data && (
            <QuizTimer
              timeLimitMinutes={60} // This should come from quiz data
              startedAt={new Date()} // This should come from attempt data
              onTimeUp={handleTimeUp}
            />
          )}
          <QuizProgress
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            answeredCount={answeredCount}
          />
        </div>

        {/* Question */}
        {currentQuestion && (
          <QuizQuestion
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            selectedAnswer={answers.get(currentQuestion.id)}
            onAnswerChange={handleAnswerChange}
          />
        )}

        {/* Error Message */}
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-600">
              {answeredCount} of {questions.length} answered
            </div>

            {isLastQuestion ? (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitQuiz.isPending}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-yellow-600 font-medium">
                  Warning: {questions.length - answeredCount} question(s) remain unanswered.
                </span>
              )}
              <span className="block mt-2">
                Are you sure you want to submit your quiz? This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={submitQuiz.isPending}>
              {submitQuiz.isPending ? 'Submitting...' : 'Submit Quiz'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
