import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';
import InstructorLayoutClient from './instructor-layout-client';

export const metadata: Metadata = generatePageMetadata(
  'Instructor Portal',
  'Comprehensive instructor tools for managing courses, students, and analytics on LEAP PM.',
  {
    section: 'instructor',
    noindex: true,
  }
);

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return <InstructorLayoutClient>{children}</InstructorLayoutClient>;
}
