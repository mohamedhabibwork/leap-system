import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generatePageMetadata(
  'Access Your Account',
  'Sign in to LEAP PM to continue your learning journey. Access courses, connect with peers, and track your progress.',
  {
    section: 'auth',
    keywords: [
      'LMS login',
      'e-learning platform',
      'student portal',
      'online learning account',
      'course access',
    ],
  }
);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
