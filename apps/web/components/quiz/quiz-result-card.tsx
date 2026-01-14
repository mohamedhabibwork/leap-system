'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Trophy, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface QuizResultCardProps {
  score: number;
  maxScore: number;
  isPassed: boolean;
  passingScore: number;
  attemptNumber: number;
  startedAt: Date;
  completedAt?: Date;
  quizTitle: string;
  quizId: number;
  attemptId: number;
  showDetailsButton?: boolean;
}

export function QuizResultCard({
  score,
  maxScore,
  isPassed,
  passingScore,
  attemptNumber,
  startedAt,
  completedAt,
  quizTitle,
  quizId,
  attemptId,
  showDetailsButton = true,
}: QuizResultCardProps) {
  const percentage = Math.round((score / maxScore) * 100);
  const timeTaken = completedAt
    ? Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000)
    : 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isPassed ? 'Congratulations!' : 'Keep Trying!'}
          </h2>
          <p className="text-gray-600">
            {isPassed
              ? 'You have successfully passed the quiz.'
              : `You need ${passingScore}% to pass. Try again to improve your score.`}
          </p>
        </div>

        {/* Score Display */}
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {percentage}%
          </div>
          <p className="text-gray-600">
            {score} out of {maxScore} points
          </p>
          <Progress value={percentage} className="mt-4 h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Attempt</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">#{attemptNumber}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-600 font-medium">Time Taken</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{timeTaken} min</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge
            variant={isPassed ? 'default' : 'destructive'}
            className={`text-lg py-2 px-4 ${isPassed ? 'bg-green-600' : ''}`}
          >
            {isPassed ? 'PASSED' : 'FAILED'}
          </Badge>
        </div>

        {/* Actions */}
        {showDetailsButton && (
          <div className="flex gap-3">
            <Button asChild className="flex-1" variant="outline">
              <Link href={`/hub/quizzes/${quizId}`}>Back to Quiz</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href={`/hub/quizzes/attempts/${attemptId}/result`}>View Details</Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
