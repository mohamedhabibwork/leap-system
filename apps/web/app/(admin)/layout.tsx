import { Navbar } from '@/components/navigation/navbar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { Home, Users, BookOpen, Settings, Flag } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Courses', href: '/admin/courses', icon: BookOpen },
  { name: 'Moderation', href: '/admin/moderation', icon: Flag },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <aside className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col fixed left-0 top-16 border-r bg-background">
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Link href={item.href}>
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>
        <main className="flex-1 md:ml-64">
          <div className="container py-6 px-4 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
