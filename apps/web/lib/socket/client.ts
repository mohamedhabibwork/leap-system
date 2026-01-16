import { io, Socket } from 'socket.io-client';

// Get base URL for Socket.io connection
const getSocketUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Socket.io works with the base backend URL (not the /api/v1 endpoint)
  // Just return the URL as-is since NEXT_PUBLIC_API_URL points to backend root
  return apiUrl;
};

const SOCKET_URL = getSocketUrl();

class SocketClient {
  private socket: Socket | null = null;
  private chatSocket: Socket | null = null;
  private notificationsSocket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('Socket URL:', SOCKET_URL);
        console.error('Error details:', error);
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Socket reconnection attempt:', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Socket reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed - max attempts reached');
    });

    return this.socket;
  }

  connectToChat(token: string) {
    // Reuse existing socket if it exists and is connected
    if (this.chatSocket && this.chatSocket.connected) {
      // Update auth token if it changed
      const currentAuth = this.chatSocket.auth as { token?: string } | undefined;
      if (currentAuth?.token !== token) {
        this.chatSocket.auth = { token };
      }
      return this.chatSocket;
    }

    // Disconnect old socket if it exists but is disconnected
    if (this.chatSocket && !this.chatSocket.connected) {
      this.chatSocket.removeAllListeners();
      this.chatSocket.disconnect();
      this.chatSocket = null;
    }

    // Create new socket connection
    this.chatSocket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity, // Keep trying to reconnect
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      forceNew: false, // Reuse existing connection if possible
      withCredentials: true,
    });

    this.chatSocket.on('connect', () => {
      console.log('✅ Chat socket connected:', this.chatSocket?.id);
    });

    this.chatSocket.on('disconnect', (reason) => {
      console.log('❌ Chat socket disconnected:', reason);
    });

    this.chatSocket.on('connect_error', (error) => {
      console.error('❌ Chat socket connection error:', error.message);
      // Log more details in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Socket URL:', `${SOCKET_URL}/chat`);
        console.error('Error details:', error);
      }
    });

    this.chatSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Chat socket reconnected after', attemptNumber, 'attempts');
    });

    this.chatSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Chat socket reconnection attempt:', attemptNumber);
    });

    this.chatSocket.on('reconnect_error', (error) => {
      console.error('❌ Chat socket reconnection error:', error.message);
    });

    this.chatSocket.on('reconnect_failed', () => {
      console.error('❌ Chat socket reconnection failed - max attempts reached');
    });

    return this.chatSocket;
  }

  connectToNotifications(token: string) {
    // Reuse existing socket if it exists and is connected
    if (this.notificationsSocket && this.notificationsSocket.connected) {
      // Update auth token if it changed
      const currentAuth = this.notificationsSocket.auth as { token?: string } | undefined;
      if (currentAuth?.token !== token) {
        this.notificationsSocket.auth = { token };
      }
      return this.notificationsSocket;
    }

    // Disconnect old socket if it exists but is disconnected
    if (this.notificationsSocket && !this.notificationsSocket.connected) {
      this.notificationsSocket.removeAllListeners();
      this.notificationsSocket.disconnect();
      this.notificationsSocket = null;
    }

    // Create new socket connection
    this.notificationsSocket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity, // Keep trying to reconnect
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      forceNew: false, // Reuse existing connection if possible
      withCredentials: true,
    });

    this.notificationsSocket.on('connect', () => {
      console.log('✅ Notifications socket connected:', this.notificationsSocket?.id);
    });

    this.notificationsSocket.on('disconnect', (reason) => {
      console.log('❌ Notifications socket disconnected:', reason);
    });

    this.notificationsSocket.on('connect_error', (error) => {
      console.error('❌ Notifications socket connection error:', error.message);
      // Log more details in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Socket URL:', `${SOCKET_URL}/notifications`);
        console.error('Error details:', error);
      }
    });

    this.notificationsSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Notifications socket reconnected after', attemptNumber, 'attempts');
    });

    this.notificationsSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Notifications socket reconnection attempt:', attemptNumber);
    });

    this.notificationsSocket.on('reconnect_error', (error) => {
      console.error('❌ Notifications socket reconnection error:', error.message);
    });

    this.notificationsSocket.on('reconnect_failed', () => {
      console.error('❌ Notifications socket reconnection failed - max attempts reached');
    });

    return this.notificationsSocket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.chatSocket) {
      this.chatSocket.removeAllListeners();
      this.chatSocket.disconnect();
      this.chatSocket = null;
    }
    if (this.notificationsSocket) {
      this.notificationsSocket.removeAllListeners();
      this.notificationsSocket.disconnect();
      this.notificationsSocket = null;
    }
  }

  disconnectChat() {
    if (this.chatSocket) {
      this.chatSocket.removeAllListeners();
      this.chatSocket.disconnect();
      this.chatSocket = null;
    }
  }

  disconnectNotifications() {
    if (this.notificationsSocket) {
      this.notificationsSocket.removeAllListeners();
      this.notificationsSocket.disconnect();
      this.notificationsSocket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  getChatSocket() {
    return this.chatSocket;
  }

  getNotificationsSocket() {
    return this.notificationsSocket;
  }
}

export const socketClient = new SocketClient();
export default socketClient;
