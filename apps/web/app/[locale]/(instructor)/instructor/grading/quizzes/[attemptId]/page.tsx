'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { PageLoader } from '@/components/loading/page-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Save,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { format } from 'date-fns';

export default function QuizGradingPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const t = useTranslations('instructor.grading');
  const router = useRouter();
  const { attemptId } = use(params);
  const attemptIdNum = parseInt(attemptId);
  const queryClient = useQueryClient();

  // Fetch quiz attempt details
  const { data: attempt, isLoading } = useQuery({
    queryKey: ['quiz-attempt', attemptIdNum],
    queryFn: () => apiClient.get(`/instructor/quizzes/attempts/${attemptIdNum}`),
    enabled: !!attemptIdNum,
  });

  // Grade essay question mutation
  const gradeEssayMutation = useMutation({
    mutationFn: ({
      answerId,
      score,
      feedback,
      maxPoints,
    }: {
      answerId: number;
      score: number;
      feedback?: string;
      maxPoints: number;
    }) =>
      apiClient.post(`/lms/quizzes/answers/${answerId}/grade`, {
        score,
        feedback,
        maxPoints,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempt', attemptIdNum] });
    },
  });

  if (isLoading) {
    return <PageLoader message={t('loading')} />;
  }

  if (!attempt) {
    return <div>{t('attemptNotFound')}</div>;
  }

  const attemptData = attempt as any;
  const essayAnswers = attemptData.answers?.filter(
    (answer: any) => answer.questionType === 'essay' && !answer.isGraded,
  ) || [];

  const gradedAnswers = attemptData.answers?.filter(
    (answer: any) => answer.isGraded,
  ) || [];

  const totalScore =
    gradedAnswers.reduce((sum: number, a: any) => sum + (a.pointsEarned || 0), 0) +
    essayAnswers.reduce((sum: number, a: any) => sum + (a.pointsEarned || 0), 0);
  const maxScore = attemptData.answers?.reduce(
    (sum: number, a: any) => sum + (a.maxPoints || 0),
    0,
  ) || 0;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← {t('back')}
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{attemptData.quizTitle || 'Quiz'}</h1>
              <p className="text-muted-foreground">
                {attemptData.courseName || ''} • {attemptData.userName || ''}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {totalScore} / {maxScore}
              </div>
              <div className="text-sm text-muted-foreground">
                {((totalScore / maxScore) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Essay Questions to Grade */}
        {essayAnswers.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              <h2 className="text-xl font-semibold">
                {t('essayQuestionsToGrade')} ({essayAnswers.length})
              </h2>
            </div>
            <div className="space-y-6">
              {essayAnswers.map((answer: any, index: number) => (
                <EssayGradingForm
                  key={answer.id}
                  answer={answer}
                  questionNumber={index + 1}
                  onGrade={(score, feedback, maxPoints) =>
                    gradeEssayMutation.mutate({
                      answerId: answer.id,
                      score,
                      feedback,
                      maxPoints,
                    })
                  }
                  isGrading={gradeEssayMutation.isPending}
                />
              ))}
            </div>
          </Card>
        )}

        {/* All Answers Review */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('allAnswers')}</h2>
          <div className="space-y-4">
            {attemptData.answers?.map((answer: any, index: number) => (
              <div
                key={answer.id}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">
                        {t('question')} {index + 1}
                      </span>
                      <Badge variant="outline">{answer.questionType}</Badge>
                      {answer.isGraded && (
                        <Badge
                          variant={answer.isCorrect ? 'default' : 'destructive'}
                          className={
                            answer.isCorrect ? 'bg-green-600' : 'bg-red-600'
                          }
                        >
                          {answer.isCorrect ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {answer.isGraded ? t('graded') : t('pending')}
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium mb-2">{answer.questionTextEn}</p>
                    {answer.answerText && (
                      <div className="p-3 bg-muted rounded-lg mb-2">
                        <p className="text-sm whitespace-pre-wrap">
                          {answer.answerText}
                        </p>
                      </div>
                    )}
                    {answer.feedback && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg mb-2">
                        <p className="text-sm font-medium mb-1">{t('feedback')}</p>
                        <p className="text-sm">{answer.feedback}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold">
                      {answer.pointsEarned || 0} / {answer.maxPoints || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">{t('points')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function EssayGradingForm({
  answer,
  questionNumber,
  onGrade,
  isGrading,
}: {
  answer: any;
  questionNumber: number;
  onGrade: (score: number, feedback: string, maxPoints: number) => void;
  isGrading: boolean;
}) {
  const t = useTranslations('instructor.grading');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setScore(answer.pointsEarned || 0);
    setFeedback(answer.feedback || '');
  }, [answer]);

  const handleSubmit = () => {
    if (score < 0 || score > answer.maxPoints) {
      alert(t('invalidScore'));
      return;
    }
    onGrade(score, feedback, answer.maxPoints);
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">
              {t('question')} {questionNumber}
            </span>
            <Badge variant="outline">essay</Badge>
          </div>
          <p className="font-medium mb-3">{answer.questionTextEn}</p>
          <div className="p-3 bg-muted rounded-lg mb-4">
            <p className="text-sm font-medium mb-2">{t('studentAnswer')}</p>
            <p className="text-sm whitespace-pre-wrap">{answer.answerText}</p>
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="text-sm text-muted-foreground mb-1">{t('maxPoints')}</div>
          <div className="text-xl font-bold">{answer.maxPoints}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`score-${answer.id}`}>
            {t('score')} (0 - {answer.maxPoints})
          </Label>
          <Input
            id={`score-${answer.id}`}
            type="number"
            min="0"
            max={answer.maxPoints}
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-end">
          <Progress
            value={(score / answer.maxPoints) * 100}
            className="h-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`feedback-${answer.id}`}>{t('feedback')} ({t('optional')})</Label>
        <Textarea
          id={`feedback-${answer.id}`}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={t('feedbackPlaceholder')}
          rows={4}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isGrading || score < 0 || score > answer.maxPoints}
        className="w-full"
      >
        <Save className="h-4 w-4 mr-2" />
        {isGrading ? t('saving') : t('saveGrade')}
      </Button>
    </div>
  );
}
