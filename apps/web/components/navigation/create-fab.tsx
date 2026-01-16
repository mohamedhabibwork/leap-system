'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Plus, 
  FileText, 
  Users, 
  Calendar, 
  Briefcase,
  MessageSquare,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CreatePostModal,
  CreateGroupModal,
  CreatePageModal,
  CreateEventModal,
  CreateJobModal,
} from '@/components/modals';
import { useAuthStore } from '@/stores/auth.store';

type ModalType = 'post' | 'group' | 'page' | 'event' | 'job' | null;

/**
 * CreateFAB Component
 * Floating Action Button with speed dial menu for quick content creation
 * 
 * Features:
 * - Shows/hides based on scroll direction
 * - Speed dial menu with all creation options
 * - Role-based options (e.g., jobs only for instructors/admin)
 * - RTL/LTR support with logical positioning
 * - Smooth animations
 */
export function CreateFAB() {
  const t = useTranslations('common.create.fab');
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const { user } = useAuthStore();

  // Hide FAB on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
        setIsOpen(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isInstructorOrAdmin = user?.role === 'instructor' || user?.role === 'admin';

  const actions = [
    {
      id: 'post' as const,
      label: t('createPost'),
      icon: MessageSquare,
      color: 'text-blue-600',
      show: true,
    },
    {
      id: 'event' as const,
      label: t('createEvent'),
      icon: Calendar,
      color: 'text-green-600',
      show: true,
    },
    {
      id: 'job' as const,
      label: t('postJob'),
      icon: Briefcase,
      color: 'text-orange-600',
      show: isInstructorOrAdmin,
    },
    {
      id: 'group' as const,
      label: t('createGroup'),
      icon: Users,
      color: 'text-purple-600',
      show: true,
    },
    {
      id: 'page' as const,
      label: t('createPage'),
      icon: FileText,
      color: 'text-pink-600',
      show: true,
    },
  ].filter(action => action.show);

  const handleActionClick = (modalType: ModalType) => {
    setActiveModal(modalType);
    setIsOpen(false);
  };

  return (
    <>
      {/* FAB Container */}
      <div
        className={cn(
          'fixed bottom-6 end-6 z-50 transition-all duration-300',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        )}
      >
        <TooltipProvider>
          <div className="flex flex-col-reverse items-end gap-3">
            {/* Speed Dial Actions */}
            {isOpen && (
              <div className="flex flex-col-reverse gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Tooltip key={action.id}>
                      <TooltipTrigger asChild>
                        <Button
                          size="lg"
                          variant="secondary"
                          className="h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform"
                          onClick={() => handleActionClick(action.id)}
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          <Icon className={cn('h-5 w-5', action.color)} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="font-medium">
                        {action.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            {/* Main FAB Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full shadow-xl hover:scale-110 transition-all duration-200"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Plus className="h-6 w-6" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="font-medium">
                {isOpen ? t('close') : t('createContent')}
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Modals */}
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
      <CreateJobModal
        open={activeModal === 'job'}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
    </>
  );
}
