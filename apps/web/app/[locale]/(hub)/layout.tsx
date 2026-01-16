import type { Metadata } from 'next';
import { Navbar } from '@/components/navigation/navbar';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { CreateFAB } from '@/components/navigation/create-fab';
import { generatePageMetadata } from '@/lib/seo/utils';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'layouts.hub' });
  
  return generatePageMetadata(
    t('title'),
    t('description'),
    {
      keywords: [
        'professional networking',
        'social network',
        'career growth',
        'online learning',
        'job opportunities',
        'professional events',
        'connect professionals',
      ],
    }
  );
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="w-full bg-background min-h-[calc(100vh-4rem)]">
        <div className="w-full">
          {children}
        </div>
      </main>
      <ChatSidebar />
      <CreateFAB />
    </div>
  );
}
