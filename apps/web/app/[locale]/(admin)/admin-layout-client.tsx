'use client';

import { Navbar } from '@/components/navigation/navbar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
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
  { nameKey: 'dashboard', href: '/admin', icon: Home },
  { nameKey: 'analytics', href: '/admin/analytics', icon: BarChart3 },
  { nameKey: 'users', href: '/admin/users', icon: Users },
  { nameKey: 'courses', href: '/admin/courses', icon: BookOpen },
  { nameKey: 'tickets', href: '/admin/tickets', icon: LifeBuoy },
  { nameKey: 'cmsPages', href: '/admin/cms-pages', icon: FileText },
  { nameKey: 'socialPosts', href: '/admin/posts', icon: MessageSquare },
  { nameKey: 'socialPages', href: '/admin/social-pages', icon: Layout },
  { nameKey: 'groups', href: '/admin/groups', icon: UsersRound },
  { nameKey: 'events', href: '/admin/events', icon: Calendar },
  { nameKey: 'jobs', href: '/admin/jobs', icon: Briefcase },
  { nameKey: 'reports', href: '/admin/reports', icon: Flag },
  { nameKey: 'lookups', href: '/admin/lookups', icon: Database },
  { nameKey: 'ads', href: '/admin/ads', icon: Megaphone },
  { nameKey: 'settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin.sidebar');
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <aside className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col fixed start-0 top-16 border-e border-border bg-background">
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Button
                    key={item.nameKey}
                    asChild
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      isActive && 'bg-secondary font-medium'
                    )}
                  >
                    <Link href={item.href}>
                      <Icon className="me-3 h-5 w-5" />
                      {t(item.nameKey)}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>
        <main className="flex-1 md:ms-64">
          <div className="container py-6 px-4 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
