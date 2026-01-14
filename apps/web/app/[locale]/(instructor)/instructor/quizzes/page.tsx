import { Metadata } from 'next';
import { QuizzesManagementClient } from './quizzes-management-client';

export const metadata: Metadata = {
  title: 'Manage Quizzes | LEAP LMS',
  description: 'Manage your course quizzes',
};

export default function QuizzesManagementPage() {
  return <QuizzesManagementClient />;
}
