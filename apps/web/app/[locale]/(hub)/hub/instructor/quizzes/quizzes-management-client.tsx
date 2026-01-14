'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileQuestion, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export function QuizzesManagementClient() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Quizzes</h1>
          <p className="text-gray-600">Create and manage quizzes for your courses</p>
        </div>
        <Button asChild>
          <Link href="/hub/instructor/quizzes/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Link>
        </Button>
      </div>

      <Card className="p-12 text-center">
        <FileQuestion className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Quiz Management</h2>
        <p className="text-gray-500 mb-4">
          Create quizzes, add questions from your question bank, and manage quiz settings.
        </p>
        <Button asChild>
          <Link href="/hub/instructor/quizzes/create">Get Started</Link>
        </Button>
      </Card>
    </div>
  );
}
