'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Users,
  Calendar,
  Briefcase,
  MessageCircle,
  User,
  Home,
  Settings,
  GraduationCap,
  BarChart,
  FileText,
  UserCheck,
  Video,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth.store';

const navigation = [
  { name: 'Home', href: '/hub', icon: Home },
  { name: 'Courses', href: '/hub/courses', icon: BookOpen },
  { name: 'Social', href: '/hub/social', icon: Users },
  { name: 'Events', href: '/hub/events', icon: Calendar },
  { name: 'Jobs', href: '/hub/jobs', icon: Briefcase },
  { name: 'Pages', href: '/hub/pages', icon: FileText },
  { name: 'Chat', href: '/hub/chat', icon: MessageCircle },
  { name: 'Profile', href: '/hub/profile', icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  return (
    <div className="hidden md:flex h-full w-64 flex-col fixed start-0 top-16 border-e bg-background">
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isFeatured = 'featured' in item && item.featured;

            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary font-medium',
                  isFeatured && !isActive && 'bg-gradient-to-r from-accent/50 to-primary/50 border border-accent dark:from-accent/30 dark:to-primary/30 dark:border-accent/50 hover:from-accent/70 hover:to-primary/70 dark:hover:from-accent/40 dark:hover:to-primary/40'
                )}
              >
                <Link href={item.href}>
                  <Icon className={cn("me-3 h-5 w-5", isFeatured && !isActive && "text-primary")} />
                  <span className={cn(isFeatured && !isActive && "text-primary font-semibold")}>
                    {item.name}
                  </span>
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Instructor Section */}
        {isInstructor && (
          <>
            <Separator className="my-4" />
            <div className="px-3">
              <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                Instructor
              </h3>
              <nav className="space-y-1">
                <Button
                  asChild
                  variant={pathname === '/hub/instructor' ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname === '/hub/instructor' && 'bg-secondary font-medium'
                  )}
                >
                  <Link href="/hub/instructor">
                    <GraduationCap className="me-3 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname.startsWith('/hub/instructor/courses') ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname.startsWith('/hub/instructor/courses') && 'bg-secondary font-medium'
                  )}
                >
                  <Link href="/hub/instructor/courses">
                    <BookOpen className="me-3 h-4 w-4" />
                    My Courses
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname.startsWith('/hub/instructor/sessions') ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname.startsWith('/hub/instructor/sessions') && 'bg-secondary font-medium'
                  )}
                >
                  <Link href="/hub/instructor/sessions">
                    <Video className="me-3 h-4 w-4" />
                    Sessions
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname.startsWith('/hub/instructor/students') ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname.startsWith('/hub/instructor/students') && 'bg-secondary font-medium'
                  )}
                >
                  <Link href="/hub/instructor/students">
                    <UserCheck className="me-3 h-4 w-4" />
                    Students
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname.startsWith('/hub/instructor/grading') ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname.startsWith('/hub/instructor/grading') && 'bg-secondary font-medium'
                  )}
                >
                  <Link href="/hub/instructor/grading">
                    <FileText className="me-3 h-4 w-4" />
                    Grading
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname.startsWith('/hub/instructor/analytics') ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname.startsWith('/hub/instructor/analytics') && 'bg-secondary font-medium'
                  )}
                >
                  <Link href="/hub/instructor/analytics">
                    <BarChart className="me-3 h-4 w-4" />
                    Analytics
                  </Link>
                </Button>
              </nav>
            </div>
          </>
        )}

        <Separator className="my-4" />

        <div className="px-3">
          <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
            My Content
          </h3>
          <nav className="space-y-1">
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/dashboard">
                <LayoutDashboard className="me-3 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/my-posts">
                <MessageSquare className="me-3 h-4 w-4" />
                My Posts
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/my-groups">
                <Users className="me-3 h-4 w-4" />
                My Groups
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/my-pages">
                <FileText className="me-3 h-4 w-4" />
                My Pages
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/my-jobs">
                <Briefcase className="me-3 h-4 w-4" />
                My Jobs
              </Link>
            </Button>
          </nav>
        </div>

        <Separator className="my-4" />

        <div className="px-3">
          <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
            Quick Links
          </h3>
          <nav className="space-y-1">
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/courses/my-courses">
                <BookOpen className="me-3 h-4 w-4" />
                My Courses
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/events/my-events">
                <Calendar className="me-3 h-4 w-4" />
                My Events
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/jobs/saved">
                <Briefcase className="me-3 h-4 w-4" />
                Saved Jobs
              </Link>
            </Button>
          </nav>
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <Button asChild variant="outline" className="w-full">
          <Link href="/hub/profile">
            <Settings className="me-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}
