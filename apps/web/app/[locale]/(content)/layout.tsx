import { setRequestLocale } from 'next-intl/server';
import { LandingHeader } from '@/components/landing/landing-header';
import { Footer } from '@/components/landing/footer';

export default async function ContentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}
