import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generatePageMetadata(
  'Browse Courses',
  'Explore our comprehensive catalog of online courses. Learn new skills from expert instructors in technology, business, design, and more.',
  {
    section: 'courses',
    keywords: [
      'online courses',
      'e-learning courses',
      'skill development',
      'professional training',
      'course catalog',
      'learn online',
    ],
  }
);

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
