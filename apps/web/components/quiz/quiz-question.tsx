'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface QuestionOption {
  id: number;
  optionTextEn: string;
  optionTextAr?: string;
  displayOrder: number;
  isCorrect?: boolean;
}

interface QuizQuestionProps {
  question: {
    id: number;
    questionTextEn: string;
    questionTextAr?: string;
    questionTypeId: number;
    points: number;
    displayOrder: number;
    options?: QuestionOption[];
  };
  questionNumber: number;
  selectedAnswer?: {
    selectedOptionId?: number;
    answerText?: string;
  };
  onAnswerChange: (questionId: number, answer: { selectedOptionId?: number; answerText?: string }) => void;
  showResults?: boolean;
  correctAnswer?: {
    isCorrect: boolean;
    pointsEarned: number;
  };
  locale?: string;
}

export function QuizQuestion({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerChange,
  showResults = false,
  correctAnswer,
  locale = 'en',
}: QuizQuestionProps) {
  const t = useTranslations('common.create.quiz');
  const [textAnswer, setTextAnswer] = useState(selectedAnswer?.answerText || '');

  const questionText = locale === 'ar' && question.questionTextAr ? question.questionTextAr : question.questionTextEn;

  const handleOptionSelect = (optionId: number) => {
    onAnswerChange(question.id, { selectedOptionId: optionId });
  };

  const handleTextChange = (text: string) => {
    setTextAnswer(text);
    onAnswerChange(question.id, { answerText: text });
  };

  const renderMultipleChoice = () => (
    <RadioGroup
      value={selectedAnswer?.selectedOptionId?.toString()}
      onValueChange={(value) => handleOptionSelect(parseInt(value))}
      disabled={showResults}
    >
      <div className="space-y-3">
        {question.options?.map((option) => {
          const optionText = locale === 'ar' && option.optionTextAr ? option.optionTextAr : option.optionTextEn;
          const isSelected = selectedAnswer?.selectedOptionId === option.id;
          const isCorrect = showResults && option.isCorrect;
          const isWrong = showResults && isSelected && !option.isCorrect;

          return (
            <div
              key={option.id}
              className={`flex items-center space-x-2 p-3 rounded-lg border ${
                isCorrect
                  ? 'bg-green-50 border-green-300'
                  : isWrong
                  ? 'bg-red-50 border-red-300'
                  : isSelected
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
              <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                {optionText}
              </Label>
              {showResults && isCorrect && (
                <Badge variant="default" className="bg-green-600">
                  {t('correct', { defaultValue: 'Correct' })}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </RadioGroup>
  );

  const renderEssay = () => (
    <Textarea
      value={textAnswer}
      onChange={(e) => handleTextChange(e.target.value)}
      placeholder={t('typeAnswerPlaceholder')}
      className="min-h-[150px]"
      disabled={showResults}
    />
  );

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Question {questionNumber}</Badge>
              <Badge variant="secondary">{question.points} {question.points === 1 ? 'point' : 'points'}</Badge>
              {showResults && correctAnswer && (
                <Badge variant={correctAnswer.isCorrect ? 'default' : 'destructive'} className={correctAnswer.isCorrect ? 'bg-green-600' : ''}>
                  {correctAnswer.isCorrect ? '✓ Correct' : '✗ Incorrect'} ({correctAnswer.pointsEarned}/{question.points})
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900">{questionText}</h3>
          </div>
        </div>

        <div className="mt-4">
          {question.questionTypeId === 1 ? renderMultipleChoice() : renderEssay()}
        </div>
      </div>
    </Card>
  );
}
