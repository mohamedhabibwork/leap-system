import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generatePageMetadata(
  'Instructor Dashboard',
  'Manage your courses, students, and teaching analytics. Access tools for creating engaging learning experiences on LEAP PM.',
  {
    section: 'instructor',
    keywords: [
      'instructor dashboard',
      'teach online',
      'course creation',
      'student management',
      'teaching tools',
      'educator platform',
    ],
    noindex: true, // Instructor dashboards are typically private
  }
);

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
