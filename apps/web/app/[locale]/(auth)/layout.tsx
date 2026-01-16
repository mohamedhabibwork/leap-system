import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/utils';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'layouts.auth' });
  
  return generatePageMetadata(
    t('title'),
    t('description'),
    {
      section: 'auth',
      keywords: [
        'LMS login',
        'e-learning platform',
        'student portal',
        'online learning account',
        'course access',
      ],
    }
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
