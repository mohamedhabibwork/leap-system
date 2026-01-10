import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';
import AdminLayoutClient from './admin-layout-client';

export const metadata: Metadata = generatePageMetadata(
  'Admin Panel',
  'LEAP PM administration and management console.',
  {
    section: 'admin',
    noindex: true,
  }
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
