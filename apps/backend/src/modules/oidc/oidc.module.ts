import { Module, forwardRef } from '@nestjs/common';
import { OidcService } from './oidc.service';
import { OidcController } from './oidc.controller';
import { OidcClientsController } from './oidc-clients.controller';
import { OidcInteractionController } from './oidc-interaction.controller';
import { AdapterFactory } from './adapters/adapter.factory';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';

/**
 * OIDC Module
 * Provides OpenID Connect server functionality
 */
@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [OidcController, OidcClientsController, OidcInteractionController],
  providers: [
    OidcService,
    AdapterFactory,
  ],
  exports: [OidcService],
})
export class OidcModule {}
