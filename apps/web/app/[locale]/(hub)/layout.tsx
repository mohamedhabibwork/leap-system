import type { Metadata } from 'next';
import { Navbar } from '@/components/navigation/navbar';
import { AppSidebar } from '@/components/navigation/app-sidebar';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { CreateFAB } from '@/components/navigation/create-fab';
import { generatePageMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generatePageMetadata(
  'LEAP Hub',
  'Access your learning dashboard, browse courses, connect with peers, and manage your educational journey in one central hub.',
  {
    keywords: [
      'student dashboard',
      'learning hub',
      'course portal',
      'online learning platform',
      'education center',
    ],
  }
);

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 md:ms-64 bg-background">
          <div className="container py-6 px-4 md:px-8">
            {children}
          </div>
        </main>
      </div>
      <ChatSidebar />
      <CreateFAB />
    </div>
  );
}
