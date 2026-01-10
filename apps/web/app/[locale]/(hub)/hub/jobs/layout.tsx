import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generatePageMetadata(
  'Job Board',
  'Explore career opportunities and job listings. Connect your learning to real-world opportunities in your field.',
  {
    section: 'jobs',
    keywords: [
      'job board',
      'career opportunities',
      'employment',
      'job listings',
      'career development',
      'job search',
    ],
  }
);

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
