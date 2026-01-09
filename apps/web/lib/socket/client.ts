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
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  connectToChat(token: string) {
    if (this.chatSocket?.connected) {
      return this.chatSocket;
    }

    this.chatSocket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    this.chatSocket.on('connect', () => {
      console.log('Chat socket connected');
    });

    this.chatSocket.on('disconnect', (reason) => {
      console.log('Chat socket disconnected:', reason);
    });

    this.chatSocket.on('connect_error', (error) => {
      console.error('Chat socket connection error:', error);
    });

    return this.chatSocket;
  }

  connectToNotifications(token: string) {
    if (this.notificationsSocket?.connected) {
      return this.notificationsSocket;
    }

    this.notificationsSocket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    this.notificationsSocket.on('connect', () => {
      console.log('Notifications socket connected');
    });

    this.notificationsSocket.on('disconnect', (reason) => {
      console.log('Notifications socket disconnected:', reason);
    });

    this.notificationsSocket.on('connect_error', (error) => {
      console.error('Notifications socket connection error:', error);
    });

    return this.notificationsSocket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.chatSocket?.disconnect();
    this.notificationsSocket?.disconnect();
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
