'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useQuizSession } from '@/hooks/use-quiz-session';
import { PageLoader } from '@/components/loading/page-loader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
  CheckCircle2,
  Circle,
  Send,
  Pause,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { formatTime } from '@/lib/utils/time';

export default function QuizTakingPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const t = useTranslations('quizzes');
  const router = useRouter();
  const { id, quizId } = use(params);
  const courseId = parseInt(id);
  const quizIdNum = parseInt(quizId);

  const {
    activeQuiz,
    timeRemaining,
    timerActive,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    startQuiz,
    answerQuestion,
    submitQuiz,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    flagQuestion,
    pauseTimer,
    resumeTimer,
    isLoading,
    isSubmitting,
  } = useQuizSession(quizIdNum);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [answers, setAnswers] = useState<Record<number, any>>({});

  // Start quiz on mount
  useEffect(() => {
    if (!activeQuiz && !isLoading) {
      startQuiz();
    }
  }, [activeQuiz, isLoading, startQuiz]);

  // Timer countdown effect
  useEffect(() => {
    if (!timerActive || !timeRemaining || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      // Time is updated by the hook via API polling
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  // Auto-submit when time expires
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining <= 0 && activeQuiz) {
      handleSubmit();
    }
  }, [timeRemaining, activeQuiz]);

  if (isLoading && !activeQuiz) {
    return <PageLoader message={t('loading')} />;
  }

  if (!activeQuiz || !currentQuestion) {
    return <PageLoader message={t('preparing')} />;
  }

  const handleAnswerChange = (value: any) => {
    if (!currentQuestion) return;

    const newAnswer: any = {
      questionId: currentQuestion.id,
    };

    if (currentQuestion.questionType === 'multiple_choice' || currentQuestion.questionType === 'true_false') {
      newAnswer.selectedOptionId = value;
    } else if (currentQuestion.questionType === 'essay') {
      newAnswer.answerText = value;
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: newAnswer,
    }));

    answerQuestion(currentQuestion.id, newAnswer);
  };

  const handleSubmit = async () => {
    try {
      const result = await submitQuiz();
      router.push(
        `/hub/courses/${courseId}/quizzes/${quizId}/results/${result.attemptId}`,
      );
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const currentAnswer = answers[currentQuestion.id] || activeQuiz.answers.get(currentQuestion.id);
  const isFlagged = currentAnswer?.isFlagged || false;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/hub/courses/${courseId}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t('backToCourse')}
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{t('takingQuiz')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('question')} {currentQuestionIndex + 1} {t('of')} {totalQuestions}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {timeRemaining !== null && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-lg">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              {timerActive ? (
                <Button variant="outline" size="sm" onClick={pauseTimer}>
                  <Pause className="h-4 w-4 mr-2" />
                  {t('pause')}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={resumeTimer}>
                  <Play className="h-4 w-4 mr-2" />
                  {t('resume')}
                </Button>
              )}
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {t(`questionType.${currentQuestion.questionType}`)}
                    </Badge>
                    <Badge variant="secondary">
                      {currentQuestion.points} {t('points')}
                    </Badge>
                    {isFlagged && (
                      <Badge variant="destructive">
                        <Flag className="h-3 w-3 mr-1" />
                        {t('flagged')}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold mb-4">
                    {currentQuestion.questionTextEn}
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => flagQuestion(currentQuestion.id)}
                >
                  <Flag className={cn('h-4 w-4', isFlagged && 'fill-current')} />
                </Button>
              </div>

              {/* Answer Options */}
              <div className="space-y-4">
                {currentQuestion.questionType === 'multiple_choice' && (
                  <RadioGroup
                    value={currentAnswer?.selectedOptionId?.toString()}
                    onValueChange={(value) =>
                      handleAnswerChange(parseInt(value, 10))
                    }
                  >
                    {currentQuestion.options?.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent"
                      >
                        <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                        <Label
                          htmlFor={option.id.toString()}
                          className="flex-1 cursor-pointer"
                        >
                          {option.optionTextEn}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.questionType === 'true_false' && (
                  <RadioGroup
                    value={currentAnswer?.selectedOptionId?.toString()}
                    onValueChange={(value) =>
                      handleAnswerChange(parseInt(value, 10))
                    }
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true" className="flex-1 cursor-pointer">
                        {t('true')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false" className="flex-1 cursor-pointer">
                        {t('false')}
                      </Label>
                    </div>
                  </RadioGroup>
                )}

                {currentQuestion.questionType === 'essay' && (
                  <Textarea
                    value={currentAnswer?.answerText || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder={t('enterYourAnswer')}
                    className="min-h-[200px]"
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Question Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">{t('questions')}</h3>
              <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                {activeQuiz.questions.map((question, index) => {
                  const isAnswered = activeQuiz.answers.has(question.id);
                  const isCurrent = index === currentQuestionIndex;
                  const isFlagged = activeQuiz.answers.get(question.id)?.isFlagged;

                  return (
                    <Button
                      key={question.id}
                      variant={isCurrent ? 'default' : isAnswered ? 'secondary' : 'outline'}
                      size="sm"
                      className={cn(
                        'relative',
                        isFlagged && 'border-destructive',
                      )}
                      onClick={() => goToQuestion(index)}
                    >
                      {isAnswered ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      {isFlagged && (
                        <Flag className="h-3 w-3 absolute top-0 right-0 text-destructive" />
                      )}
                      <span className="ml-2">{index + 1}</span>
                    </Button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('previous')}
          </Button>

          <div className="flex items-center gap-2">
            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                {t('submitQuiz')}
              </Button>
            ) : (
              <Button onClick={nextQuestion}>
                {t('next')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('submitQuiz')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('submitConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? t('submitting') : t('submit')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
