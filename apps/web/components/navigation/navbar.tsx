'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Menu, 
  LogOut, 
  User, 
  Settings, 
  Plus,
  MessageSquare,
  Users,
  FileText,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { signOut } from 'next-auth/react';
import { NotificationCenter } from '@/components/shared/notification-center';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { SimpleThemeToggle } from '@/components/theme-toggle';
import { 
  CreatePostModal,
  CreateGroupModal,
  CreatePageModal,
  CreateEventModal,
  CreateJobModal,
} from '@/components/modals';

interface NavbarProps {
  children?: React.ReactNode;
}

type ModalType = 'post' | 'group' | 'page' | 'event' | 'job' | null;

export function Navbar({ children }: NavbarProps = {}) {
  const router = useRouter();
  const t = useTranslations('navigation');
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
    useAuthStore.getState().logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4">
        {/* Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="md:hidden"
          aria-label={t('menu.toggle')}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href="/hub" className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="hidden font-bold sm:inline-block">{t('logo.text')}</span>
        </Link>

        {/* Search */}
        <form 
          onSubmit={handleSearch} 
          className="flex-1 max-w-md hidden sm:flex"
          aria-label={t('search.label')}
        >
          <div className="relative w-full">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder={t('search.placeholder')}
              className="ps-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t('search.label')}
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ms-auto">
          {/* Theme Toggle */}
          <SimpleThemeToggle />
          
          {/* Language Switcher */}
          <LocaleSwitcher />
          
          {/* Notifications - Unified for all users */}
          <NotificationCenter />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full"
                aria-label={t('user.menu')}
              >
                <Avatar>
                  <AvatarImage src={user?.avatar} alt={user?.username || t('user.avatar')} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-start">
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
                <Link href={`/hub/social/profile/${user?.id}`}>
                  <User className="me-2 h-4 w-4" />
                  {t('user.profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hub/profile">
                  <Settings className="me-2 h-4 w-4" />
                  {t('user.settings')}
                </Link>
              </DropdownMenuItem>
              {user?.role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">{t('user.admin')}</Link>
                </DropdownMenuItem>
              )}
              {(user?.role === 'instructor' || user?.role === 'admin') && (
                <DropdownMenuItem asChild>
                  <Link href="/hub/instructor">{t('user.instructor')}</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="me-2 h-4 w-4" />
                {t('user.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Create Modals */}
      <CreatePostModal
        open={activeModal === 'post'}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
      <CreateGroupModal
        open={activeModal === 'group'}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
      <CreatePageModal
        open={activeModal === 'page'}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
      <CreateEventModal
        open={activeModal === 'event'}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
      {/* TODO: CreateJobModal requires companyId - implement when User type includes companyId */}
    </header>
  );
}
