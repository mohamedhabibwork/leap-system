import { logEvent as firebaseLogEvent, setUserId as firebaseSetUserId, setUserProperties as firebaseSetUserProperties } from 'firebase/analytics';
import { analytics } from './config';

/**
 * Analytics utility functions with comprehensive error handling
 * All functions are wrapped in try-catch blocks to ensure analytics errors never break the app
 */

/**
 * Log a page view event
 * @param pageName - Name of the page being viewed
 * @param params - Additional parameters to track
 */
export function logPageView(pageName: string, params?: Record<string, any>): void {
  try {
    if (typeof window === 'undefined') {
      // Skip on server-side rendering
      return;
    }

    if (!analytics) {
      // Silently skip if analytics is not configured - this is expected in development
      return;
    }

    firebaseLogEvent(analytics, 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...params,
    });
  } catch (error) {
    console.warn('[Analytics] Error logging page view:', error);
  }
}

/**
 * Log a custom event
 * @param eventName - Name of the event
 * @param params - Event parameters
 */
export function logEvent(eventName: string, params?: Record<string, any>): void {
  try {
    if (typeof window === 'undefined') {
      // Skip on server-side rendering
      return;
    }

    if (!analytics) {
      // Silently skip if analytics is not configured - this is expected in development
      return;
    }

    firebaseLogEvent(analytics, eventName, params);
  } catch (error) {
    console.warn(`[Analytics] Error logging event "${eventName}":`, error);
  }
}

/**
 * Set user properties for analytics
 * @param properties - User properties to set
 */
export function setUserProperties(properties: Record<string, any>): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    if (!analytics) {
      // Silently skip if analytics is not configured - this is expected in development
      return;
    }

    firebaseSetUserProperties(analytics, properties);
  } catch (error) {
    console.warn('[Analytics] Error setting user properties:', error);
  }
}

/**
 * Set user ID for analytics
 * @param userId - User ID to set
 */
export function setUserId(userId: string | null): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    if (!analytics) {
      // Silently skip if analytics is not configured - this is expected in development
      return;
    }

    firebaseSetUserId(analytics, userId);
  } catch (error) {
    console.warn('[Analytics] Error setting user ID:', error);
  }
}

/**
 * Common event tracking functions for specific use cases
 */

export const AnalyticsEvents = {
  // Auth events
  login: (method: string) => logEvent('login', { method }),
  signUp: (method: string) => logEvent('sign_up', { method }),
  logout: () => logEvent('logout'),

  // Course events
  viewCourse: (courseId: string, courseName: string) =>
    logEvent('view_item', { item_id: courseId, item_name: courseName, item_category: 'course' }),
  enrollCourse: (courseId: string, courseName: string) =>
    logEvent('join_group', { group_id: courseId, group_name: courseName }),
  completeLearning: (courseId: string, lessonId: string) =>
    logEvent('tutorial_complete', { course_id: courseId, lesson_id: lessonId }),

  // Social events
  createPost: (postType: string) => logEvent('post_created', { post_type: postType }),
  shareContent: (contentType: string, contentId: string) =>
    logEvent('share', { content_type: contentType, item_id: contentId }),
  likeContent: (contentType: string, contentId: string) =>
    logEvent('like', { content_type: contentType, item_id: contentId }),

  // Ad events
  viewAd: (adId: string, adType: string) =>
    logEvent('ad_view', { ad_id: adId, ad_type: adType }),
  clickAd: (adId: string, adType: string) =>
    logEvent('ad_click', { ad_id: adId, ad_type: adType }),

  // Job events
  viewJob: (jobId: string, jobTitle: string) =>
    logEvent('view_item', { item_id: jobId, item_name: jobTitle, item_category: 'job' }),
  applyJob: (jobId: string, jobTitle: string) =>
    logEvent('apply_job', { job_id: jobId, job_title: jobTitle }),

  // Event events
  viewEvent: (eventId: string, eventName: string) =>
    logEvent('view_item', { item_id: eventId, item_name: eventName, item_category: 'event' }),
  registerEvent: (eventId: string, eventName: string) =>
    logEvent('register_event', { event_id: eventId, event_name: eventName }),

  // Chat events
  sendMessage: (chatType: string) => logEvent('send_message', { chat_type: chatType }),
  startChat: (recipientType: string) => logEvent('start_chat', { recipient_type: recipientType }),

  // Search events
  search: (searchTerm: string, searchType: string) =>
    logEvent('search', { search_term: searchTerm, search_type: searchType }),

  // Navigation events
  clickNavigation: (destination: string, source: string) =>
    logEvent('select_content', { content_type: 'navigation', destination, source }),
};
