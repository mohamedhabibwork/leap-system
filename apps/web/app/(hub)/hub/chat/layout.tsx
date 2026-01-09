import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generatePageMetadata(
  'Messages',
  'Chat with instructors and fellow learners. Private messaging for LEAP PM community members.',
  {
    noindex: true, // Private messaging should not be indexed
    keywords: ['messaging', 'chat', 'private messages'],
  }
);

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
