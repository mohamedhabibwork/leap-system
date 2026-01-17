import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../../database/database.module';
import { DatabaseAdapter } from './database.adapter';
import type { Adapter } from 'oidc-provider';

/**
 * Factory for creating OIDC adapters
 * Creates adapter instances for different model types
 */
@Injectable()
export class AdapterFactory {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  /**
   * Create an adapter instance for a specific model type
   */
  createAdapter(name: string): Adapter {
    return new DatabaseAdapter(this.db, name);
  }
}
