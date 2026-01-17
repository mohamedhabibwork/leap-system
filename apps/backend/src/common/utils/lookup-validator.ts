import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { lookups, lookupTypes } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';

/**
 * Utility service for validating lookup IDs
 * Ensures that lookup IDs exist and belong to the correct lookup type
 */
@Injectable()
export class LookupValidator {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Validate that a lookup ID exists and belongs to the specified lookup type
   * @param lookupId The lookup ID to validate
   * @param lookupTypeCode The lookup type code (e.g., 'event_type', 'job_status')
   * @param fieldName The field name for error messages (optional)
   * @throws BadRequestException if lookup doesn't exist or doesn't belong to the type
   */
  async validateLookup(
    lookupId: number,
    lookupTypeCode: string,
    fieldName?: string,
  ): Promise<void> {
    const [lookup] = await this.db
      .select({ id: lookups.id })
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(
        and(
          eq(lookups.id, lookupId),
          eq(lookupTypes.code, lookupTypeCode),
          eq(lookups.isDeleted, false),
          eq(lookups.isActive, true),
        ),
      )
      .limit(1);

    if (!lookup) {
      const field = fieldName || lookupTypeCode;
      throw new BadRequestException(
        `Invalid ${field}: Lookup with ID ${lookupId} does not exist or is not of type '${lookupTypeCode}'`,
      );
    }
  }

  /**
   * Validate an optional lookup ID (only validates if provided)
   * @param lookupId The lookup ID to validate (can be undefined)
   * @param lookupTypeCode The lookup type code
   * @param fieldName The field name for error messages (optional)
   */
  async validateOptionalLookup(
    lookupId: number | undefined,
    lookupTypeCode: string,
    fieldName?: string,
  ): Promise<void> {
    if (lookupId !== undefined && lookupId !== null) {
      await this.validateLookup(lookupId, lookupTypeCode, fieldName);
    }
  }

  /**
   * Get lookup ID by code and type
   * @param lookupCode The lookup code (e.g., 'public', 'private')
   * @param lookupTypeCode The lookup type code (e.g., 'group_privacy')
   * @returns The lookup ID
   * @throws BadRequestException if lookup doesn't exist
   */
  async getLookupIdByCode(
    lookupCode: string,
    lookupTypeCode: string,
  ): Promise<number> {
    // First, check if the lookup type exists
    const [lookupType] = await this.db
      .select({ id: lookupTypes.id, code: lookupTypes.code })
      .from(lookupTypes)
      .where(eq(lookupTypes.code, lookupTypeCode))
      .limit(1);

    if (!lookupType) {
      throw new BadRequestException(
        `Lookup type '${lookupTypeCode}' not found. Please ensure the database has been seeded with lookup types.`,
      );
    }

    // Then, check for the lookup value
    const [lookup] = await this.db
      .select({ id: lookups.id })
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(
        and(
          eq(lookups.code, lookupCode),
          eq(lookupTypes.code, lookupTypeCode),
          eq(lookups.isDeleted, false),
          eq(lookups.isActive, true),
        ),
      )
      .limit(1);

    if (!lookup) {
      // Check if lookup exists but is inactive or deleted
      const [inactiveLookup] = await this.db
        .select({ id: lookups.id, isActive: lookups.isActive, isDeleted: lookups.isDeleted })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(
          and(
            eq(lookups.code, lookupCode),
            eq(lookupTypes.code, lookupTypeCode),
          ),
        )
        .limit(1);

      if (inactiveLookup) {
        throw new BadRequestException(
          `Lookup with code '${lookupCode}' exists for type '${lookupTypeCode}' but is ${inactiveLookup.isDeleted ? 'deleted' : 'inactive'}. Please ensure the database has been properly seeded.`,
        );
      }

      throw new BadRequestException(
        `Lookup with code '${lookupCode}' not found for type '${lookupTypeCode}'. Please ensure the database has been seeded with lookup values. Expected codes for '${lookupTypeCode}': 'public', 'private', 'secret'.`,
      );
    }

    return lookup.id;
  }
}
