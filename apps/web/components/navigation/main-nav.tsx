'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  BookOpen,
  Briefcase,
  Calendar,
  MessageSquare,
} from 'lucide-react';

interface NavItem {
  nameKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const mainNavigation: NavItem[] = [
  {
    nameKey: 'main.home',
    href: '/hub/social',
    icon: Home,
    exact: false,
  },
  {
    nameKey: 'main.myNetwork',
    href: '/hub/social/connections',
    icon: Users,
    exact: false,
  },
  {
    nameKey: 'main.jobs',
    href: '/hub/jobs',
    icon: Briefcase,
    exact: false,
  },
  {
    nameKey: 'main.learning',
    href: '/hub/courses',
    icon: BookOpen,
    exact: false,
  },
  {
    nameKey: 'main.events',
    href: '/hub/events',
    icon: Calendar,
    exact: false,
  },
  {
    nameKey: 'main.messaging',
    href: '/hub/chat',
    icon: MessageSquare,
    exact: false,
  },
];

export function MainNav() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  return (
    <nav className="flex items-center gap-0.5">
      {mainNavigation.map((item) => {
        const Icon = item.icon;
        let isActive = false;
        if (item.exact) {
          isActive = pathname === item.href;
        } else {
          // Special handling for home route - should match /hub/social exactly (feed page)
          if (item.href === '/hub/social') {
            isActive = pathname === '/hub/social';
          } else {
            isActive = pathname.startsWith(item.href);
          }
        }

        return (
          <Link
            key={item.nameKey}
            href={item.href}
            className={cn(
              'relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-lg transition-all duration-200 min-w-[70px]',
              'hover:bg-muted/50 active:scale-95',
              isActive 
                ? 'text-primary font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className={cn(
              'h-5 w-5 transition-transform',
              isActive && 'scale-110'
            )} />
            <span className="text-[10px] sm:text-xs font-medium hidden xl:block leading-tight">
              {t(item.nameKey)}
            </span>
            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
