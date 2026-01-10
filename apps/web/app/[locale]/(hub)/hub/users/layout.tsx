import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generatePageMetadata(
  'Community Members',
  'Discover and connect with fellow learners, instructors, and education professionals in the LEAP PM community.',
  {
    keywords: [
      'community members',
      'learners',
      'instructors',
      'education network',
      'student directory',
    ],
  }
);

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
