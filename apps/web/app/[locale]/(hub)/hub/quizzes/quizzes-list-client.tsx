'use client';

import { useMyQuizAttempts } from '@/lib/hooks/use-quiz-api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileQuestion, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

import { useTranslations } from 'next-intl';

export function QuizzesListClient() {
  const t = useTranslations('quizzes.list');
  const { data: attempts, isLoading } = useMyQuizAttempts();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
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
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <Card className="p-12 text-center">
          <FileQuestion className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('noAttempts')}</h2>
          <p className="text-gray-500">
            {t('noAttemptsDesc')}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
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
                          {t('passed')}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          {t('failed')}
                        </>
                      )}
                    </Badge>
                  )}
                  {!attempt.completedAt && (
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {t('inProgress')}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>{t('attempt', { number: attempt.attemptNumber })}</p>
                  {attempt.completedAt && attempt.score !== null && (
                    <p>
                      {t('score', { 
                        score: attempt.score, 
                        max: attempt.maxScore,
                        percentage: Math.round((attempt.score / attempt.maxScore) * 100)
                      })}
                    </p>
                  )}
                  <p>{t('started', { date: format(new Date(attempt.startedAt), 'PPp') })}</p>
                  {attempt.completedAt && (
                    <p>{t('completed', { date: format(new Date(attempt.completedAt), 'PPp') })}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {attempt.completedAt ? (
                  <Button asChild>
                    <Link href={`/hub/quizzes/attempts/${attempt.id}/result`}>
                      {t('viewResults')}
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={`/hub/quizzes/${attempt.quizId}/take`}>
                      {t('continue')}
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
