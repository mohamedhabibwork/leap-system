import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generatePageMetadata(
  'Advertisements',
  'Browse featured content and promotions on LEAP PM.',
  {
    noindex: true, // Ad pages typically shouldn't be indexed
    keywords: ['advertisements', 'promotions', 'featured content'],
  }
);

export default function AdsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
