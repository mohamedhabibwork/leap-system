import { Metadata } from 'next';
import { QuestionBankClient } from './question-bank-client';

export const metadata: Metadata = {
  title: 'Question Bank | LEAP LMS',
  description: 'Manage your question bank',
};

export default function QuestionBankPage() {
  return <QuestionBankClient />;
}
