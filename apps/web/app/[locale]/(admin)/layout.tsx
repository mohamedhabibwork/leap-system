import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';
import { getTranslations } from 'next-intl/server';
import AdminLayoutClient from './admin-layout-client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'layouts.admin' });
  
  return generatePageMetadata(
    t('title'),
    t('description'),
    {
      section: 'admin',
      noindex: true,
    }
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
