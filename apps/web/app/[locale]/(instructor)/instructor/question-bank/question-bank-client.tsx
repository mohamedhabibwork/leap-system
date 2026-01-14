'use client';

import { useState } from 'react';
import { useGeneralQuestions } from '@/lib/hooks/use-question-bank-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function QuestionBankClient() {
  const { data: generalQuestions, isLoading } = useGeneralQuestions();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Question Bank</h1>
          <p className="text-gray-600">Manage reusable questions for your quizzes</p>
        </div>
        <Button asChild>
          <Link href="/instructor/question-bank/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Question
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General Questions</TabsTrigger>
          <TabsTrigger value="course">Course-Specific</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </div>
          ) : !generalQuestions || generalQuestions.length === 0 ? (
            <Card className="p-12 text-center">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No General Questions Yet</h2>
              <p className="text-gray-500 mb-4">
                Create reusable questions that can be used across all your courses.
              </p>
              <Button asChild>
                <Link href="/instructor/question-bank/create">Create First Question</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {generalQuestions.map((question) => (
                <Card key={question.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">General</Badge>
                        <Badge variant="outline">{question.points} {question.points === 1 ? 'point' : 'points'}</Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{question.questionTextEn}</h3>
                      {question.explanationEn && (
                        <p className="text-sm text-gray-600">{question.explanationEn}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="course" className="space-y-4 mt-6">
          <Card className="p-12 text-center">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Course-Specific Questions</h2>
            <p className="text-gray-500">
              Create questions specific to individual courses.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
