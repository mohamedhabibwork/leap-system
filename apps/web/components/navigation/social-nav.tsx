'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  BookOpen,
  Briefcase,
  MessageCircle,
  Bell,
  User,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { signOut } from 'next-auth/react';
import { NotificationCenter } from '@/components/shared/notification-center';

const mainNavigation = [
  { 
    nameKey: 'main.home', 
    href: '/hub', 
    icon: Home,
    exact: true,
  },
  { 
    nameKey: 'main.network', 
    href: '/hub/social', 
    icon: Users,
  },
  { 
    nameKey: 'main.learning', 
    href: '/hub/courses', 
    icon: BookOpen,
  },
  { 
    nameKey: 'main.jobs', 
    href: '/hub/jobs', 
    icon: Briefcase,
  },
  { 
    nameKey: 'main.messaging', 
    href: '/hub/chat', 
    icon: MessageCircle,
  },
];

export function SocialNav() {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
    useAuthStore.getState().logout();
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.nameKey}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors hover:bg-muted',
                    isActive && 'text-primary'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium hidden sm:block">
                    {t(item.nameKey)}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <NotificationCenter />

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center gap-1 px-4 py-2 h-auto"
                >
                  <div className="flex items-center gap-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user?.avatar} alt={user?.username || 'User'} />
                      <AvatarFallback className="text-xs">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3 w-3 hidden sm:block" />
                  </div>
                  <span className="text-xs font-medium hidden sm:block">
                    {t('user.me')}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/hub/users/${user?.id}`}>
                    <User className="me-2 h-4 w-4" />
                    {t('user.viewProfile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/hub/settings">
                    {t('user.settings')}
                  </Link>
                </DropdownMenuItem>
                {(user?.role === 'instructor' || user?.role === 'admin') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/hub/instructor">
                        {t('user.instructor')}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      {t('user.admin')}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  {t('user.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
