import { Metadata } from 'next';
import { QuizStartClient } from './quiz-start-client';

export const metadata: Metadata = {
  title: 'Quiz | LEAP LMS',
  description: 'Start quiz attempt',
};

export default function QuizStartPage({ params }: { params: { quizId: string } }) {
  return <QuizStartClient quizId={parseInt(params.quizId)} />;
}
