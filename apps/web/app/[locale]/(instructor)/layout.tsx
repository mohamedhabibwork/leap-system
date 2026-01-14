import type { Metadata } from 'next';
import { Navbar } from '@/components/navigation/navbar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from '@/i18n/navigation';
import { Home, BookOpen, Users, GraduationCap, BarChart, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generatePageMetadata(
  'Instructor Portal',
  'Comprehensive instructor tools for managing courses, students, and analytics on LEAP PM.',
  {
    section: 'instructor',
    noindex: true,
  }
);

const navigation = [
  { name: 'Dashboard', href: '/instructor', icon: Home },
  { name: 'My Courses', href: '/instructor/courses', icon: BookOpen },
  { name: 'Students', href: '/instructor/students', icon: Users },
  { name: 'Grading', href: '/instructor/grading', icon: GraduationCap },
  { name: 'Quizzes', href: '/instructor/quizzes', icon: GraduationCap },
  { name: 'Question Bank', href: '/instructor/question-bank', icon: BookOpen },
  { name: 'Resources', href: '/instructor/resources', icon: BookOpen },
  { name: 'Sessions', href: '/instructor/sessions', icon: Calendar },
  { name: 'Analytics', href: '/instructor/analytics', icon: BarChart },
  { name: 'Revenue', href: '/instructor/revenue', icon: DollarSign },
  { name: 'Communication', href: '/instructor/communication', icon: MessageSquare },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <aside className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col fixed left-0 top-16 border-r border-border bg-background">
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
