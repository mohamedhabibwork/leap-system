import { io, Socket } from 'socket.io-client';

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  actor?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

type NotificationCallback = (notification: Notification) => void;
type ConnectionCallback = (connected: boolean) => void;

/**
 * NotificationsWebSocket Client
 * Handles real-time notification delivery via WebSocket
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Connection state management
 * - Event listeners for incoming notifications
 * - Graceful error handling
 * - Memory leak prevention with proper cleanup
 */
class NotificationsWebSocket {
  private socket: Socket | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private notificationCallbacks: Set<NotificationCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Only initialize on client side
      this.setupBeforeUnload();
    }
  }

  /**
   * Connect to the notifications WebSocket server
   */
  connect(token: string) {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
      
      this.socket = io(wsUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: false, // We'll handle reconnection manually
        timeout: 10000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to connect to notifications WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect(token);
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.notifyConnectionCallbacks(false);
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Subscribe to notification events
   */
  onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    
    // Immediately notify of current status
    callback(this.isConnected());
    
    // Return unsubscribe function
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to notifications WebSocket');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.notifyConnectionCallbacks(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from notifications WebSocket:', reason);
      this.notifyConnectionCallbacks(false);

      // Attempt to reconnect if not a manual disconnect
      if (reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    });

    // Listen for notification events
    this.socket.on('notification', (notification: Notification) => {
      this.notifyNotificationCallbacks(notification);
    });

    // Listen for notification read updates
    this.socket.on('notification:read', (data: { notificationId: number }) => {
      // Emit a special event that can be handled by the UI
      this.notifyNotificationCallbacks({
        id: data.notificationId,
        type: 'read',
      } );
    });

    // Listen for bulk notifications
    this.socket.on('notifications:bulk', (notifications: Notification[]) => {
      notifications.forEach(notification => {
        this.notifyNotificationCallbacks(notification);
      });
    });
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect(token?: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    console.log(`Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      
      if (token) {
        this.connect(token);
      } else {
        // Try to get token from session and reconnect
        this.tryReconnectWithSession();
      }
    }, delay);
  }

  /**
   * Try to reconnect using stored session
   */
  private async tryReconnectWithSession() {
    try {
      // This would need to be implemented based on your auth setup
      // For now, we'll just log that we need a token
      console.log('Attempting to reconnect with session...');
      
      // You would typically call your auth service here
      // const session = await getSession();
      // if (session?.accessToken) {
      //   this.connect(session.accessToken);
      // }
    } catch (error) {
      console.error('Failed to reconnect with session:', error);
    }
  }

  /**
   * Notify all notification callbacks
   */
  private notifyNotificationCallbacks(notification: Notification) {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  /**
   * Notify all connection callbacks
   */
  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  /**
   * Setup cleanup on page unload
   */
  private setupBeforeUnload() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });
    }
  }

  /**
   * Emit a custom event (for marking as read, etc.)
   */
  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

// Create a singleton instance
export const notificationsWS = new NotificationsWebSocket();

export default notificationsWS;
