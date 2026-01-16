import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';
import { getTranslations } from 'next-intl/server';
import InstructorLayoutClient from './instructor-layout-client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'layouts.instructor' });
  
  return generatePageMetadata(
    t('title'),
    t('description'),
    {
      section: 'instructor',
      noindex: true,
    }
  );
}

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return <InstructorLayoutClient>{children}</InstructorLayoutClient>;
}
