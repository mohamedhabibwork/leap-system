import { Navbar } from '@/components/navigation/navbar';
import { AppSidebar } from '@/components/navigation/app-sidebar';

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 md:ml-64">
          <div className="container py-6 px-4 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
