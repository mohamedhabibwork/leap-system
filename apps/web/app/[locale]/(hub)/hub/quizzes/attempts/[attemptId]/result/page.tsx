     import { Metadata } from 'next';
import { QuizResultClient } from './quiz-result-client';

export const metadata: Metadata = {
  title: 'Quiz Results | LEAP LMS',
  description: 'View your quiz results',
};

export default function QuizResultPage({ params }: { params: { attemptId: string } }) {
  return <QuizResultClient attemptId={parseInt(params.attemptId)} />;
}
