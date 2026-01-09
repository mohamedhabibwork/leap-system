import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';

class SocketClient {
  private socket: Socket | null = null;
  private chatSocket: Socket | null = null;
  private notificationsSocket: Socket | null = null;

  connect(token: string) {
    this.socket = io(WS_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  connectToChat(token: string) {
    this.chatSocket = io(`${WS_URL}/chat`, {
      auth: { token },
    });

    this.chatSocket.on('connect', () => {
      console.log('Chat socket connected');
    });

    return this.chatSocket;
  }

  connectToNotifications(token: string) {
    this.notificationsSocket = io(`${WS_URL}/notifications`, {
      auth: { token },
    });

    this.notificationsSocket.on('connect', () => {
      console.log('Notifications socket connected');
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
