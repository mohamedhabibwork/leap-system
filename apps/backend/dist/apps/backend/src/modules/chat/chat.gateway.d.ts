import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleMessage(data: any, client: Socket): {
        success: boolean;
        messageId: number;
    };
    handleJoinRoom(data: {
        roomId: string;
    }, client: Socket): {
        success: boolean;
    };
    handleTypingStart(data: any, client: Socket): void;
    handleTypingStop(data: any, client: Socket): void;
}
//# sourceMappingURL=chat.gateway.d.ts.map