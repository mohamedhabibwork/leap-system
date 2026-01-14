import { Metadata } from 'next';
import { QuizTakeClient } from './quiz-take-client';

export const metadata: Metadata = {
  title: 'Take Quiz | LEAP LMS',
  description: 'Answer quiz questions',
};

export default function QuizTakePage({ params }: { params: { quizId: string } }) {
  return <QuizTakeClient quizId={parseInt(params.quizId)} />;
}
