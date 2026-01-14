'use client';

import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
}

export function QuizProgress({ currentQuestion, totalQuestions, answeredCount }: QuizProgressProps) {
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Question {currentQuestion} of {totalQuestions}
          </span>
          <span className="text-gray-600">
            {answeredCount} answered
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </Card>
  );
}
