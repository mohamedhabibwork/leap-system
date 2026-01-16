import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { DatabaseModule } from '../../database/database.module';
import { WsAuthMiddleware } from '../../common/middleware/ws-auth.middleware';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule, // Import AuthModule to get TokenVerificationService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '1d' 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, WsAuthMiddleware],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
