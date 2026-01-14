import { Metadata } from 'next';
import { QuizzesListClient } from './quizzes-list-client';

export const metadata: Metadata = {
  title: 'My Quizzes | LEAP LMS',
  description: 'View your quiz attempts and available quizzes',
};

export default function QuizzesPage() {
  return <QuizzesListClient />;
}
