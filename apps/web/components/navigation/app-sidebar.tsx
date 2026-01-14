'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
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
  { nameKey: 'main.home', href: '/hub', icon: Home },
  { nameKey: 'main.courses', href: '/hub/courses', icon: BookOpen },
  { nameKey: 'main.social', href: '/hub/social', icon: Users },
  { nameKey: 'main.events', href: '/hub/events', icon: Calendar },
  { nameKey: 'main.jobs', href: '/hub/jobs', icon: Briefcase },
  { nameKey: 'main.pages', href: '/hub/pages', icon: FileText },
  { nameKey: 'main.chat', href: '/hub/chat', icon: MessageCircle },
  { nameKey: 'main.profile', href: '/hub/profile', icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const { user } = useAuthStore();
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  return (
    <div className="hidden md:flex h-full w-64 flex-col fixed start-0 top-16 border-e bg-background">
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
                  <span>
                    {t(item.nameKey)}
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
              <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase text-start">
                {t('sidebar.instructor')}
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
                    {t('sidebar.dashboard')}
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
                    {t('sidebar.myCourses')}
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
                    {t('sidebar.sessions')}
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
                    {t('sidebar.students')}
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
                    {t('sidebar.grading')}
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
                    {t('sidebar.analytics')}
                  </Link>
                </Button>
              </nav>
            </div>
          </>
        )}

        <Separator className="my-4" />

        <div className="px-3">
          <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase text-start">
            {t('sidebar.myContent')}
          </h3>
          <nav className="space-y-1">
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/dashboard">
                <LayoutDashboard className="me-3 h-4 w-4" />
                {t('sidebar.dashboard')}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/my-posts">
                <MessageSquare className="me-3 h-4 w-4" />
                {t('sidebar.myPosts')}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/my-groups">
                <Users className="me-3 h-4 w-4" />
                {t('sidebar.myGroups')}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/my-pages">
                <FileText className="me-3 h-4 w-4" />
                {t('sidebar.myPages')}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/my-jobs">
                <Briefcase className="me-3 h-4 w-4" />
                {t('sidebar.myJobs')}
              </Link>
            </Button>
          </nav>
        </div>

        <Separator className="my-4" />

        <div className="px-3">
          <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase text-start">
            {t('sidebar.quickLinks')}
          </h3>
          <nav className="space-y-1">
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/courses/my-courses">
                <BookOpen className="me-3 h-4 w-4" />
                {t('sidebar.myCourses')}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/events/my-events">
                <Calendar className="me-3 h-4 w-4" />
                {t('sidebar.myEvents')}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/hub/jobs/saved">
                <Briefcase className="me-3 h-4 w-4" />
                {t('sidebar.savedJobs')}
              </Link>
            </Button>
          </nav>
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <Button asChild variant="outline" className="w-full">
          <Link href="/hub/profile">
            <Settings className="me-2 h-4 w-4" />
            {t('sidebar.settings')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
