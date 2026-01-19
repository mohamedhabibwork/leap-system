'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeedLayoutProps {
  leftSidebar: ReactNode;
  mainContent: ReactNode;
  rightSidebar: ReactNode;
  className?: string;
}

/**
 * LinkedIn-style 3-column feed layout
 * - Left sidebar: Profile card, Quick access
 * - Main content: Feed with posts
 * - Right sidebar: Trending, Suggestions, Ads
 */
export function FeedLayout({
  leftSidebar,
  mainContent,
  rightSidebar,
  className,
}: FeedLayoutProps) {
  return (
    <div className={cn('w-full mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 max-w-[1440px] mx-auto">
        {/* Left Sidebar - 25% width, hidden on mobile/tablet, visible on desktop */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            {leftSidebar}
          </div>
        </aside>

        {/* Main Content - 50% width on desktop, full width on mobile/tablet */}
        <main className="lg:col-span-6 space-y-4 sm:space-y-6">
          {mainContent}
        </main>

        {/* Right Sidebar - 25% width, hidden on mobile, visible on tablet+ */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            {rightSidebar}
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * 2-Column layout for pages that don't need left sidebar
 */
export function TwoColumnLayout({
  mainContent,
  rightSidebar,
  className,
}: Omit<FeedLayoutProps, 'leftSidebar'>) {
  return (
    <div className={cn('w-full mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 max-w-[1440px] mx-auto">
        {/* Main Content - 66% width */}
        <main className="lg:col-span-8 space-y-4 sm:space-y-6">
          {mainContent}
        </main>

        {/* Right Sidebar - 33% width */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-20 space-y-4">
            {rightSidebar}
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Single column layout for mobile-first pages
 */
export function SingleColumnLayout({
  children,
  className,
  maxWidth = '4xl',
}: {
  children: ReactNode;
  className?: string;
  maxWidth?: 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}) {
  const maxWidthClass = {
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <div className={cn('w-full mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6', maxWidthClass, className)}>
      {children}
    </div>
  );
}
