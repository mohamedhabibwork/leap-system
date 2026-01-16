import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { AdminNotificationsService } from './admin-notifications.service';
import { FCMService } from './fcm.service';
import { FCMTokensService } from './fcm-tokens.service';
import { EmailService } from './email.service';
import { DatabaseModule } from '../../database/database.module';
import { WsAuthMiddleware } from '../../common/middleware/ws-auth.middleware';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule), // Import AuthModule to get TokenVerificationService
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
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    AdminNotificationsService,
    FCMService,
    FCMTokensService,
    EmailService,
    WsAuthMiddleware,
  ],
  exports: [
    NotificationsService,
    NotificationsGateway,
    AdminNotificationsService,
    FCMService,
    FCMTokensService,
    EmailService,
  ],
})
export class NotificationsModule {}
