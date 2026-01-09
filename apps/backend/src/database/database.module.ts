import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@leap-lms/database';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';
export const DRIZZLE_DB = 'DRIZZLE_DB';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL') || 
          'postgresql://postgres:@localhost:5432/leap_lms';
        
        const queryClient = postgres(connectionString);
        return drizzle(queryClient, { schema });
      },
      inject: [ConfigService],
    },
    {
      provide: DRIZZLE_DB,
      useExisting: DATABASE_CONNECTION,
    },
  ],
  exports: [DATABASE_CONNECTION, DRIZZLE_DB],
})
export class DatabaseModule {}
