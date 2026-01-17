'use client';

import { useState } from 'react';
import * as React from 'react';
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
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { signOut } from 'next-auth/react';
import { NotificationCenter } from '@/components/shared/notification-center';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { SimpleThemeToggle } from '@/components/theme-toggle';
import { MainNav } from '@/components/navigation/main-nav';

interface NavbarProps {
  children?: React.ReactNode;
}

export function Navbar({ children }: NavbarProps = {}) {
  const router = useRouter();
  const t = useTranslations('navigation');
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering Radix UI after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          {/* Menu Button - Mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="md:hidden shrink-0"
            aria-label={t('menu.toggle')}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link 
            href="/hub/social" 
            className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🎓</span>
            <span className="hidden font-bold text-lg sm:inline-block">{t('logo.text')}</span>
          </Link>

          {/* Search - Mobile */}
          <form 
            onSubmit={handleSearch} 
            className="flex-1 max-w-xs md:hidden"
            aria-label={t('search.label')}
          >
            <div className="relative w-full">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                placeholder={t('search.placeholder')}
                className="ps-10 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t('search.label')}
              />
            </div>
          </form>

          {/* Main Navigation - Center */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <MainNav />
          </div>

          {/* Search - Desktop */}
          <form 
            onSubmit={handleSearch} 
            className="hidden lg:flex flex-1 max-w-xs"
            aria-label={t('search.label')}
          >
            <div className="relative w-full">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                placeholder={t('search.placeholder')}
                className="ps-10 h-9 text-sm bg-muted/50 border-muted focus:bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t('search.label')}
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 ms-auto shrink-0">
            {/* Theme Toggle */}
            <SimpleThemeToggle />
            
            {/* Language Switcher */}
            <LocaleSwitcher />
            
            {/* Notifications */}
            <NotificationCenter />

            {/* User Menu */}
            {mounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all"
                    aria-label={t('user.menu')}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.username || t('user.avatar')} />
                      <AvatarFallback className="text-xs">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-start w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/hub/social/profile/${user?.id}`} className="cursor-pointer">
                    <User className="me-2 h-4 w-4" />
                    {t('user.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/hub/profile" className="cursor-pointer">
                    <Settings className="me-2 h-4 w-4" />
                    {t('user.settings')}
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">{t('user.admin')}</Link>
                  </DropdownMenuItem>
                )}
                {(user?.role === 'instructor' || user?.role === 'admin') && (
                  <DropdownMenuItem asChild>
                    <Link href="/hub/instructor" className="cursor-pointer">{t('user.instructor')}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="me-2 h-4 w-4" />
                  {t('user.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all"
                aria-label={t('user.menu')}
                suppressHydrationWarning
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.username || t('user.avatar')} />
                  <AvatarFallback className="text-xs">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
