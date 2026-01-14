'use client';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FeedLayoutProps {
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FeedLayout({ 
  leftSidebar, 
  rightSidebar, 
  children,
  className 
}: FeedLayoutProps) {
  return (
    <div className={cn('container mx-auto px-4 py-6', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1440px] mx-auto">
        {/* Left Sidebar - Profile & Quick Access */}
        {leftSidebar && (
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {leftSidebar}
            </div>
          </aside>
        )}

        {/* Main Content Feed */}
        <main className={cn(
          'col-span-1',
          leftSidebar && rightSidebar ? 'lg:col-span-6' : 
          leftSidebar || rightSidebar ? 'lg:col-span-9' : 
          'lg:col-span-12'
        )}>
          {children}
        </main>

        {/* Right Sidebar - Suggestions & Ads */}
        {rightSidebar && (
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {rightSidebar}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// Responsive Mobile Sidebar Toggle (optional)
export function MobileSidebarDrawer({ 
  children, 
  side = 'left' 
}: { 
  children: React.ReactNode; 
  side?: 'left' | 'right';
}) {
  return (
    <div className={cn(
      'lg:hidden fixed inset-y-0 z-40 w-80 bg-background border-e transform transition-transform',
      side === 'left' ? 'start-0' : 'end-0'
    )}>
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}
