'use client';

import { useQuizResult } from '@/lib/hooks/use-quiz-api';
import { QuizResultCard } from '@/components/quiz/quiz-result-card';
import { QuizQuestion } from '@/components/quiz/quiz-question';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QuizResultClientProps {
  attemptId: number;
}

export function QuizResultClient({ attemptId }: QuizResultClientProps) {
  const { data: result, isLoading, error } = useQuizResult(attemptId);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="space-y-4">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load quiz results.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="space-y-6">
        {/* Result Summary */}
        <QuizResultCard
          score={result.score || 0}
          maxScore={result.maxScore}
          isPassed={result.isPassed}
          passingScore={result.passingScore}
          attemptNumber={result.attemptNumber || 1}
          startedAt={result.startedAt}
          completedAt={result.completedAt}
          quizTitle={result.quiz.titleEn}
          quizId={result.quiz.id}
          attemptId={result.attemptId}
          showDetailsButton={false}
        />

        {/* Detailed Review */}
        {result.showCorrectAnswers && result.answers && (
          <Card className="p-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Questions</TabsTrigger>
                <TabsTrigger value="correct">Correct</TabsTrigger>
                <TabsTrigger value="incorrect">Incorrect</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {result.answers.map((answer, index) => (
                  <QuizQuestion
                    key={answer.questionId}
                    question={{
                      id: answer.questionId,
                      questionTextEn: answer.questionTextEn,
                      questionTextAr: answer.questionTextAr,
                      questionTypeId: 1, // Assuming multiple choice
                      points: answer.maxPoints,
                      displayOrder: index,
                      options: answer.options,
                    }}
                    questionNumber={index + 1}
                    selectedAnswer={{
                      selectedOptionId: answer.selectedOptionId,
                      answerText: answer.answerText,
                    }}
                    onAnswerChange={() => {}}
                    showResults={true}
                    correctAnswer={{
                      isCorrect: answer.isCorrect,
                      pointsEarned: answer.pointsEarned,
                    }}
                  />
                ))}
              </TabsContent>

              <TabsContent value="correct" className="space-y-4 mt-6">
                {result.answers
                  .filter((answer) => answer.isCorrect)
                  .map((answer, index) => (
                    <QuizQuestion
                      key={answer.questionId}
                      question={{
                        id: answer.questionId,
                        questionTextEn: answer.questionTextEn,
                        questionTextAr: answer.questionTextAr,
                        questionTypeId: 1,
                        points: answer.maxPoints,
                        displayOrder: index,
                        options: answer.options,
                      }}
                      questionNumber={result.answers.findIndex((a) => a.questionId === answer.questionId) + 1}
                      selectedAnswer={{
                        selectedOptionId: answer.selectedOptionId,
                        answerText: answer.answerText,
                      }}
                      onAnswerChange={() => {}}
                      showResults={true}
                      correctAnswer={{
                        isCorrect: answer.isCorrect,
                        pointsEarned: answer.pointsEarned,
                      }}
                    />
                  ))}
                {result.answers.filter((a) => a.isCorrect).length === 0 && (
                  <p className="text-center text-gray-500 py-8">No correct answers</p>
                )}
              </TabsContent>

              <TabsContent value="incorrect" className="space-y-4 mt-6">
                {result.answers
                  .filter((answer) => !answer.isCorrect)
                  .map((answer, index) => (
                    <QuizQuestion
                      key={answer.questionId}
                      question={{
                        id: answer.questionId,
                        questionTextEn: answer.questionTextEn,
                        questionTextAr: answer.questionTextAr,
                        questionTypeId: 1,
                        points: answer.maxPoints,
                        displayOrder: index,
                        options: answer.options,
                      }}
                      questionNumber={result.answers.findIndex((a) => a.questionId === answer.questionId) + 1}
                      selectedAnswer={{
                        selectedOptionId: answer.selectedOptionId,
                        answerText: answer.answerText,
                      }}
                      onAnswerChange={() => {}}
                      showResults={true}
                      correctAnswer={{
                        isCorrect: answer.isCorrect,
                        pointsEarned: answer.pointsEarned,
                      }}
                    />
                  ))}
                {result.answers.filter((a) => !a.isCorrect).length === 0 && (
                  <p className="text-center text-gray-500 py-8">All answers are correct!</p>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        )}

        {!result.showCorrectAnswers && (
          <Card className="p-6 text-center">
            <p className="text-gray-600">
              The instructor has chosen not to show correct answers for this quiz.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
