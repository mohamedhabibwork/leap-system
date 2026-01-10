'use client';

import { ReactNode } from 'react';

/**
 * ChatSocketProvider - DEPRECATED
 * 
 * Socket connections are now managed by:
 * - SocketConnectionProvider (uses Zustand store)
 * - useChatMessages hook (TanStack Query + Zustand)
 * 
 * This component is kept for backward compatibility but does nothing.
 * It will be removed in a future update.
 */
export function ChatSocketProvider({ children }: { children: ReactNode }) {
  // Socket connections now managed by SocketConnectionProvider + Zustand
  return <>{children}</>;
}
