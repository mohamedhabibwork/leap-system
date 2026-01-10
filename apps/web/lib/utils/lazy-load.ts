import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Lazy Load Utilities
 * Provides helpers for code splitting and lazy loading components
 */

// Loading component for lazy-loaded modules
export const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

/**
 * Lazy load a component with loading fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading || LoadingFallback,
    ssr: options?.ssr ?? true,
  });
}

/**
 * Preload a component for faster subsequent loading
 */
export function preloadComponent(
  importFunc: () => Promise<any>
): void {
  importFunc();
}

// Export commonly lazy-loaded components
export const LazyComponents = {
  // Modals
  CreateEventModal: lazyLoad(() => import('@/components/modals/create-event-modal').then(m => ({ default: m.CreateEventModal }))),
  CreateJobModal: lazyLoad(() => import('@/components/modals/create-job-modal').then(m => ({ default: m.CreateJobModal }))),
  CreateCourseModal: lazyLoad(() => import('@/components/modals/create-course-modal').then(m => ({ default: m.CreateCourseModal }))),
  
  // Heavy components
  NotificationPanel: lazyLoad(() => import('@/components/notifications/notification-panel').then(m => ({ default: m.NotificationPanel }))),
  SearchResults: lazyLoad(() => import('@/components/search/search-results').then(m => ({ default: m.SearchResults }))),
};

export default lazyLoad;
