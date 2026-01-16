'use client';

import { use, useState, useEffect } from 'react';
import { useQuiz, useUpdateQuiz } from '@/lib/hooks/use-instructor-api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { PageLoader } from '@/components/loading/page-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Save,
  Plus,
  GripVertical,
  Trash2,
  Eye,
  Settings,
  FileQuestion,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function QuizEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('instructor.quizzes');
  const router = useRouter();
  const { id } = use(params);
  const quizId = parseInt(id);
  const queryClient = useQueryClient();

  const { data: quiz, isLoading } = useQuiz(quizId);
  const updateQuizMutation = useUpdateQuiz();

  const [titleEn, setTitleEn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>();
  const [maxAttempts, setMaxAttempts] = useState<number | undefined>();
  const [passingScore, setPassingScore] = useState(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);

  // Fetch quiz questions
  const { data: quizQuestions } = useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: () => apiClient.get(`/lms/quizzes/${quizId}/questions`),
    enabled: !!quizId,
  });

  // Fetch question bank
  const { data: questionBank } = useQuery({
    queryKey: ['question-bank'],
    queryFn: () => apiClient.get('/lms/question-bank'),
    enabled: isQuestionBankOpen,
  });

  // Add questions to quiz
  const addQuestionsMutation = useMutation({
    mutationFn: (questionIds: number[]) =>
      apiClient.post(`/lms/quizzes/${quizId}/questions`, { questionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] });
      setIsQuestionBankOpen(false);
      setSelectedQuestionIds([]);
    },
  });

  // Remove question from quiz
  const removeQuestionMutation = useMutation({
    mutationFn: (questionId: number) =>
      apiClient.delete(`/lms/quizzes/${quizId}/questions/${questionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] });
    },
  });

  // Update question order
  const updateOrderMutation = useMutation({
    mutationFn: (updates: Array<{ questionId: number; displayOrder: number }>) =>
      apiClient.patch(`/lms/quizzes/${quizId}/questions/order`, { updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] });
    },
  });

  // Initialize form with quiz data
  useEffect(() => {
    if (quiz) {
      setTitleEn(quiz.titleEn || '');
      setDescriptionEn(quiz.descriptionEn || '');
      setTimeLimitMinutes(quiz.timeLimitMinutes);
      setMaxAttempts(quiz.maxAttempts);
      setPassingScore(quiz.passingScore || 60);
      setShuffleQuestions(quiz.shuffleQuestions || false);
      setShowCorrectAnswers(quiz.showCorrectAnswers !== false);
    }
  }, [quiz]);

  if (isLoading) {
    return <PageLoader message={t('loading')} />;
  }

  if (!quiz) {
    return <div>{t('quizNotFound')}</div>;
  }

  const handleSave = () => {
    updateQuizMutation.mutate({
      id: quizId,
      data: {
        titleEn,
        descriptionEn,
        timeLimitMinutes,
        maxAttempts,
        passingScore,
        shuffleQuestions,
        showCorrectAnswers,
      },
    });
  };

  const handleAddQuestions = () => {
    if (selectedQuestionIds.length > 0) {
      addQuestionsMutation.mutate(selectedQuestionIds);
    }
  };

  const handleRemoveQuestion = (questionId: number) => {
    if (confirm(t('confirmRemoveQuestion'))) {
      removeQuestionMutation.mutate(questionId);
    }
  };

  const questions = quizQuestions?.questions || [];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← {t('back')}
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('editQuiz')}</h1>
              <p className="text-muted-foreground">{quiz.titleEn}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/instructor/quizzes/${quizId}/preview`)}>
                <Eye className="h-4 w-4 mr-2" />
                {t('preview')}
              </Button>
              <Button onClick={handleSave} disabled={updateQuizMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateQuizMutation.isPending ? t('saving') : t('save')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5" />
                <h2 className="text-xl font-semibold">{t('quizSettings')}</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">{t('title')}</Label>
                  <Input
                    id="title"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder={t('quizTitlePlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="description">{t('description')}</Label>
                  <Textarea
                    id="description"
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder={t('quizDescriptionPlaceholder')}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeLimit">{t('timeLimit')} ({t('minutes')})</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={timeLimitMinutes || ''}
                      onChange={(e) =>
                        setTimeLimitMinutes(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      placeholder={t('noLimit')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAttempts">{t('maxAttempts')}</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      value={maxAttempts || ''}
                      onChange={(e) =>
                        setMaxAttempts(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      placeholder={t('unlimited')}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="passingScore">{t('passingScore')} (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="shuffle">{t('shuffleQuestions')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('shuffleQuestionsDescription')}
                    </p>
                  </div>
                  <Switch
                    id="shuffle"
                    checked={shuffleQuestions}
                    onCheckedChange={setShuffleQuestions}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showAnswers">{t('showCorrectAnswers')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('showCorrectAnswersDescription')}
                    </p>
                  </div>
                  <Switch
                    id="showAnswers"
                    checked={showCorrectAnswers}
                    onCheckedChange={setShowCorrectAnswers}
                  />
                </div>
              </div>
            </Card>

            {/* Questions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">
                    {t('questions')} ({questions.length})
                  </h2>
                </div>
                <Dialog open={isQuestionBankOpen} onOpenChange={setIsQuestionBankOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('addQuestions')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t('addQuestionsFromBank')}</DialogTitle>
                      <DialogDescription>{t('selectQuestionsToAdd')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {questionBank?.map((question: any) => (
                        <div
                          key={question.id}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={selectedQuestionIds.includes(question.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedQuestionIds([...selectedQuestionIds, question.id]);
                              } else {
                                setSelectedQuestionIds(
                                  selectedQuestionIds.filter((id) => id !== question.id),
                                );
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{question.questionTextEn}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('type')}: {question.questionType} • {t('points')}:{' '}
                              {question.points}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsQuestionBankOpen(false)}
                        >
                          {t('cancel')}
                        </Button>
                        <Button
                          onClick={handleAddQuestions}
                          disabled={selectedQuestionIds.length === 0 || addQuestionsMutation.isPending}
                        >
                          {t('addSelected')} ({selectedQuestionIds.length})
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('noQuestions')}</p>
                  </div>
                ) : (
                  questions.map((question: any, index: number) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <span className="font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium">{question.questionTextEn}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {question.points} {t('points')}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveQuestion(question.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('type')}: {question.questionType}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">{t('quizInfo')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('totalQuestions')}</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('totalPoints')}</span>
                  <span className="font-medium">
                    {questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('passingScore')}</span>
                  <span className="font-medium">{passingScore}%</span>
                </div>
                {timeLimitMinutes && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('timeLimit')}</span>
                    <span className="font-medium">{timeLimitMinutes} {t('minutes')}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
