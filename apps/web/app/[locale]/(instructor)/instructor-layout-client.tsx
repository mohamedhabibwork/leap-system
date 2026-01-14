'use client';

import { Navbar } from '@/components/navigation/navbar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Home, BookOpen, Users, GraduationCap, BarChart, Calendar, DollarSign, MessageSquare } from 'lucide-react';

const navigation = [
  { nameKey: 'dashboard', href: '/instructor', icon: Home },
  { nameKey: 'myCourses', href: '/instructor/courses', icon: BookOpen },
  { nameKey: 'students', href: '/instructor/students', icon: Users },
  { nameKey: 'grading', href: '/instructor/grading', icon: GraduationCap },
  { nameKey: 'quizzes', href: '/instructor/quizzes', icon: GraduationCap },
  { nameKey: 'questionBank', href: '/instructor/question-bank', icon: BookOpen },
  { nameKey: 'resources', href: '/instructor/resources', icon: BookOpen },
  { nameKey: 'sessions', href: '/instructor/sessions', icon: Calendar },
  { nameKey: 'analytics', href: '/instructor/analytics', icon: BarChart },
  { nameKey: 'revenue', href: '/instructor/revenue', icon: DollarSign },
  { nameKey: 'communication', href: '/instructor/communication', icon: MessageSquare },
];

export default function InstructorLayoutClient({ children }: { children: React.ReactNode }) {
  const t = useTranslations('instructor.sidebar');
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
