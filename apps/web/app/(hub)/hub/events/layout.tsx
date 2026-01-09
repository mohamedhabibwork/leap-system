import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generatePageMetadata(
  'Events & Webinars',
  'Discover upcoming webinars, live sessions, workshops, and training events. Connect with instructors and learners in real-time.',
  {
    section: 'events',
    keywords: [
      'webinars',
      'live sessions',
      'online workshops',
      'training events',
      'virtual events',
      'educational seminars',
    ],
  }
);

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
