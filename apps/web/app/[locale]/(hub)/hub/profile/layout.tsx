import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generatePageMetadata(
  'My Profile',
  'Manage your LEAP PM profile, view your progress, track achievements, and customize your learning experience.',
  {
    noindex: true, // Personal profile pages should not be indexed
    keywords: ['user profile', 'account settings', 'learning progress'],
  }
);

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
