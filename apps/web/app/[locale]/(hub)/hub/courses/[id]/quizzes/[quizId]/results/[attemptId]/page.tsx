'use client';

import { use } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useQuizResult } from '@/hooks/use-quiz-result';
import { PageLoader } from '@/components/loading/page-loader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  Clock,
  Award,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export default function QuizResultsPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string; attemptId: string }>;
}) {
  const t = useTranslations('quizzes');
  const router = useRouter();
  const { id, quizId, attemptId } = use(params);
  const courseId = parseInt(id);
  const quizIdNum = parseInt(quizId);
  const attemptIdNum = parseInt(attemptId);

  const { result, isLoading } = useQuizResult(attemptIdNum);

  if (isLoading) {
    return <PageLoader message={t('loadingResults')} />;
  }

  if (!result) {
    return <div>{t('resultNotFound')}</div>;
  }

  const scorePercentage = (result.score / result.maxScore) * 100;
  const isPassed = result.isPassed;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            ) : (
              <div className="rounded-full bg-red-100 p-4">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isPassed ? t('passed') : t('failed')}
          </h1>
          <p className="text-muted-foreground">{t('quizCompleted')}</p>
        </div>

        {/* Score Card */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{result.score}</div>
              <div className="text-sm text-muted-foreground">{t('yourScore')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{result.maxScore}</div>
              <div className="text-sm text-muted-foreground">{t('maxScore')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{result.passingScore}%</div>
              <div className="text-sm text-muted-foreground">{t('passingScore')}</div>
            </div>
          </div>
          <Progress value={scorePercentage} className="mt-6" />
          <div className="text-center mt-4 text-sm text-muted-foreground">
            {scorePercentage.toFixed(1)}% {t('correct')}
          </div>
        </Card>

        {/* Quiz Details */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('quizDetails')}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('startedAt')}</span>
              <span>{new Date(result.startedAt).toLocaleString()}</span>
            </div>
            {result.completedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('completedAt')}</span>
                <span>{new Date(result.completedAt).toLocaleString()}</span>
              </div>
            )}
            {result.completedAt && result.startedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('timeTaken')}</span>
                <span>
                  {Math.round(
                    (new Date(result.completedAt).getTime() -
                      new Date(result.startedAt).getTime()) /
                      60000,
                  )}{' '}
                  {t('minutes')}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Answers Review */}
        {result.showCorrectAnswers && result.answers && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('answerReview')}</h2>
            <div className="space-y-4">
              {result.answers.map((answer: any, index: number) => (
                <div
                  key={answer.questionId}
                  className={cn(
                    'p-4 border rounded-lg',
                    answer.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200',
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">
                          {t('question')} {index + 1}
                        </span>
                        {answer.isCorrect ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t('correct')}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            {t('incorrect')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-2">{answer.questionTextEn}</p>
                      {answer.answerText && (
                        <p className="text-sm text-muted-foreground">
                          {t('yourAnswer')}: {answer.answerText}
                        </p>
                      )}
                    </div>
                    <div className="text-sm font-semibold">
                      {answer.pointsEarned} / {answer.maxPoints} {t('points')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/hub/courses/${courseId}`)}
          >
            {t('backToCourse')}
          </Button>
          <Button
            onClick={() => router.push(`/hub/courses/${courseId}/quizzes/${quizId}/take`)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('retakeQuiz')}
          </Button>
          {isPassed && (
            <Button
              variant="default"
              onClick={() =>
                router.push(`/hub/courses/${courseId}/certificate`)
              }
            >
              <Award className="h-4 w-4 mr-2" />
              {t('downloadCertificate')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
