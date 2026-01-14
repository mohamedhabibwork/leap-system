import { useEffect, useCallback } from 'react';
import { useSocketStore } from '@/stores/socket.store';
import { usePresenceStore } from '@/stores/presence.store';

/**
 * Hook to manage online/presence status tracking
 * Listens to WebSocket events for user online/offline status
 */
export function usePresence() {
  const { chatSocket, chatConnected } = useSocketStore();
  const { 
    onlineUsers, 
    setOnlineUsers, 
    addOnlineUser, 
    removeOnlineUser,
    isUserOnline,
  } = usePresenceStore();

  // Setup WebSocket listeners for presence events
  useEffect(() => {
    if (!chatSocket || !chatConnected) return;

    // Handle initial online users list on connection
    const handleConnected = (data: { onlineUsers?: number[] }) => {
      if (data.onlineUsers) {
        setOnlineUsers(data.onlineUsers);
      }
    };

    // Handle user coming online
    const handleUserOnline = ({ userId }: { userId: number }) => {
      addOnlineUser(userId);
    };

    // Handle user going offline
    const handleUserOffline = ({ userId }: { userId: number }) => {
      removeOnlineUser(userId);
    };

    // Attach listeners
    chatSocket.on('connected', handleConnected);
    chatSocket.on('user:online', handleUserOnline);
    chatSocket.on('user:offline', handleUserOffline);

    // Request current online users
    chatSocket.emit('presence:get');

    // Handle presence get response
    const handlePresenceResponse = (data: { onlineUsers?: number[] }) => {
      if (data.onlineUsers) {
        setOnlineUsers(data.onlineUsers);
      }
    };
    
    chatSocket.on('presence:response', handlePresenceResponse);

    // Cleanup
    return () => {
      chatSocket.off('connected', handleConnected);
      chatSocket.off('user:online', handleUserOnline);
      chatSocket.off('user:offline', handleUserOffline);
      chatSocket.off('presence:response', handlePresenceResponse);
    };
  }, [chatSocket, chatConnected, setOnlineUsers, addOnlineUser, removeOnlineUser]);

  // Check if specific users are online
  const checkPresence = useCallback((userIds: number[]) => {
    if (!chatSocket || !chatConnected) {
      return {};
    }
    
    // Request presence check
    chatSocket.emit('presence:check', { userIds }, (response: { statuses?: Record<number, boolean> }) => {
      // The response handler is called with the result
      if (response.statuses) {
        Object.entries(response.statuses).forEach(([id, isOnline]) => {
          if (isOnline) {
            addOnlineUser(parseInt(id, 10));
          } else {
            removeOnlineUser(parseInt(id, 10));
          }
        });
      }
    });
  }, [chatSocket, chatConnected, addOnlineUser, removeOnlineUser]);

  return {
    onlineUsers: Array.from(onlineUsers),
    onlineCount: onlineUsers.size,
    isUserOnline,
    checkPresence,
  };
}

/**
 * Component-level hook to check if a specific user is online
 */
export function useIsUserOnline(userId: number | undefined) {
  const { isUserOnline } = usePresenceStore();
  
  if (!userId) return false;
  return isUserOnline(userId);
}
