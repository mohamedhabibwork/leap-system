import { Module, Global } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { ResourceOwnerGuard } from './guards/resource-owner.guard';
import { OwnershipService } from './services/ownership.service';
import { LookupValidator } from './utils/lookup-validator';
import {
  CoursePolicy,
  EnrollmentPolicy,
  AssignmentPolicy,
  PostPolicy,
} from './policies';
import { DatabaseModule } from '../database/database.module';

/**
 * Global Common Module
 * Provides shared guards, services, policies, and utilities across the application
 */
@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    // Guards
    RolesGuard,
    ResourceOwnerGuard,
    // Services
    OwnershipService,
    LookupValidator,
    // Policies
    CoursePolicy,
    EnrollmentPolicy,
    AssignmentPolicy,
    PostPolicy,
  ],
  exports: [
    // Export guards so they can be used in other modules
    RolesGuard,
    ResourceOwnerGuard,
    // Export services
    OwnershipService,
    LookupValidator,
    // Export policies
    CoursePolicy,
    EnrollmentPolicy,
    AssignmentPolicy,
    PostPolicy,
  ],
})
export class CommonModule {}
