import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generatePageMetadata(
  'Social Learning',
  'Connect with fellow learners, join discussion groups, share knowledge, and collaborate in the LEAP PM community.',
  {
    section: 'social',
    keywords: [
      'learning community',
      'student network',
      'discussion forums',
      'peer learning',
      'social learning',
      'study groups',
    ],
  }
);

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
