import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class SyncUserToKeycloakDto {
  @ApiProperty({ description: 'User ID to sync to Keycloak' })
  @IsNumber()
  userId: number;
}

export class SyncRolesDto {
  @ApiPropertyOptional({ description: 'Sync roles to Keycloak', default: true })
  @IsOptional()
  @IsBoolean()
  syncRoles?: boolean;

  @ApiPropertyOptional({ description: 'Sync permissions to Keycloak', default: true })
  @IsOptional()
  @IsBoolean()
  syncPermissions?: boolean;
}

export class BulkSyncUsersDto {
  @ApiPropertyOptional({ description: 'Specific user IDs to sync (leave empty for all)', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  userIds?: number[];

  @ApiPropertyOptional({ description: 'Batch size for processing', default: 50 })
  @IsOptional()
  @IsNumber()
  batchSize?: number;
}

export class SyncConfigDto {
  @ApiPropertyOptional({ description: 'Enable/disable sync' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Sync on user creation' })
  @IsOptional()
  @IsBoolean()
  syncOnCreate?: boolean;

  @ApiPropertyOptional({ description: 'Sync on user update' })
  @IsOptional()
  @IsBoolean()
  syncOnUpdate?: boolean;
}
