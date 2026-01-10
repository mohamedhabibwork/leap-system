'use client';

import { ReactNode } from 'react';
import { useSocketConnection } from '@/lib/hooks/use-socket-connection';

/**
 * Socket Connection Provider
 * Uses Zustand store for state management instead of React Context
 * Minimal useEffect usage - only for connection lifecycle
 */
export function SocketConnectionProvider({ children }: { children: ReactNode }) {
  // This hook manages socket connections using Zustand
  // No need to pass down context - components access sockets via useSocketStore()
  useSocketConnection();

  return <>{children}</>;
}
