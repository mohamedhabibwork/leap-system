'use client';

import { Navbar } from '@/components/navigation/navbar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationCenter } from '@/components/admin/shared/notification-center';
import { WebSocketProvider } from '@/lib/websocket/websocket-provider';
import Link from 'next/link';
import {
  Home,
  Users,
  BookOpen,
  Settings,
  Flag,
  BarChart3,
  LifeBuoy,
  FileText,
  MessageSquare,
  Layout,
  UsersRound,
  Calendar,
  Briefcase,
  Database,
  Megaphone,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Courses', href: '/admin/courses', icon: BookOpen },
  { name: 'Tickets', href: '/admin/tickets', icon: LifeBuoy },
  { name: 'CMS Pages', href: '/admin/cms-pages', icon: FileText },
  { name: 'Social Posts', href: '/admin/posts', icon: MessageSquare },
  { name: 'Social Pages', href: '/admin/social-pages', icon: Layout },
  { name: 'Groups', href: '/admin/groups', icon: UsersRound },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { name: 'Reports', href: '/admin/reports', icon: Flag },
  { name: 'Lookups', href: '/admin/lookups', icon: Database },
  { name: 'Ads', href: '/admin/ads', icon: Megaphone },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketProvider>
      <div className="min-h-screen">
        <Navbar>
          <NotificationCenter />
        </Navbar>
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
    </WebSocketProvider>
  );
}
