# Security Audit Checklist

## Overview
This document tracks the security audit status for all backend controllers, ensuring proper authentication, authorization, and data ownership verification.

**Last Updated**: 2026-01-10  
**Status**: IN PROGRESS  
**Critical Issues**: TBD  
**Completion**: 6% (2/33 controllers)

## Security Requirements

### ✅ Required for ALL Endpoints (except explicitly public)
1. **Authentication**: `@UseGuards(JwtAuthGuard)` 
2. **Authorization**: `@UseGuards(RolesGuard)` with `@Roles(Role.XXX)`
3. **Ownership**: `@UseGuards(ResourceOwnerGuard)` for resource-specific endpoints
4. **Use Role Enum**: `Role.ADMIN` instead of `'admin'` strings

### ✅ Resource-Specific Endpoints
For endpoints with `:id` parameter that modify or access user-specific data:
- Add `@ResourceType('resourceName')`
- Use `ResourceOwnerGuard` in guards stack
- OR use `@SkipOwnership()` if ownership is checked in service

### ✅ Public Endpoints
- Use `@Public()` decorator explicitly
- Add `@SkipOwnership()` if guards are applied at controller level

## Controllers Audit Status

### ✅ Core Auth
- [ ] **auth.controller.ts** - NEEDS AUDIT
  - Login, register, logout should be public
  - Profile operations need ownership checks
  - Password reset needs ownership
  - 2FA endpoints need ownership

### ✅ User Management
- [x] **users.controller.ts** - ✅ UPDATED
  - POST /users - Admin only ✅
  - GET /users - Admin/Instructor only ✅  
  - GET /users/me - Own profile ✅
  - GET /users/:id - Public profile ✅
  - PATCH /users/:id - Needs ownership guard
  - DELETE /users/:id - Admin + ownership

### ✅ LMS - Courses
- [x] **courses.controller.ts** - ✅ UPDATED
  - POST - Instructor/Admin ✅
  - GET (list) - Public ✅
  - GET /:id - Public (with draft checks) ✅
  - PATCH /:id - Owner/Admin with ownership ✅
  - DELETE /:id - Admin with ownership ✅

- [ ] **enrollments.controller.ts** - NEEDS AUDIT
  - POST - Student (self) or Admin
  - GET /:id - Owner or course instructor
  - PATCH /:id - Instructor only
  - DELETE /:id - Owner or Admin

- [ ] **assignments.controller.ts** - NEEDS AUDIT
  - POST - Instructor (course owner)
  - GET /:id - Enrolled students or instructor
  - PATCH /:id - Instructor (course owner)
  - DELETE /:id - Instructor (course owner)
  - POST /:id/submit - Enrolled student only

- [ ] **quizzes.controller.ts** - NEEDS AUDIT
  - Similar to assignments

- [ ] **lessons.controller.ts** - NEEDS AUDIT
  - POST - Instructor (course owner)
  - GET /:id - Enrolled students or instructor
  - PATCH /:id - Instructor (course owner)
  - DELETE /:id - Instructor (course owner)

- [ ] **sessions.controller.ts** - NEEDS AUDIT
  - POST - Instructor
  - GET /:id - Enrolled students or instructor
  - PATCH /:id - Instructor (owner)
  - DELETE /:id - Instructor (owner)

- [ ] **instructor.controller.ts** - NEEDS AUDIT
  - All endpoints - Instructor role only
  - Own courses/students access

- [ ] **student.controller.ts** - NEEDS AUDIT
  - All endpoints - Student role only
  - Own enrollments/progress access

### ✅ Social Features
- [ ] **posts.controller.ts** - NEEDS AUDIT
  - POST - All authenticated users
  - GET (list) - Public/friends based on visibility
  - GET /:id - Visibility checks
  - PATCH /:id - Owner or Admin
  - DELETE /:id - Owner or Admin

- [ ] **groups.controller.ts** - NEEDS AUDIT
  - POST - All authenticated users
  - GET /:id - Members or public groups
  - PATCH /:id - Group admins/owners
  - DELETE /:id - Owner or Admin

- [ ] **pages.controller.ts** - NEEDS AUDIT
  - POST - Instructor/Recruiter/Admin
  - GET /:id - Public or page members
  - PATCH /:id - Page admins
  - DELETE /:id - Page owner or Admin

- [ ] **comments.controller.ts** - NEEDS AUDIT
  - POST - All authenticated users
  - PATCH /:id - Owner or Admin
  - DELETE /:id - Owner or Admin

- [ ] **notes.controller.ts** - NEEDS AUDIT
  - POST - All authenticated users
  - GET /:id - Owner or instructors (based on visibility)
  - PATCH /:id - Owner only
  - DELETE /:id - Owner only

### ✅ Content & Media
- [ ] **media.controller.ts** - NEEDS AUDIT
  - POST /upload - All authenticated users
  - GET /:id - Depends on associated resource
  - DELETE /:id - Owner or Admin

- [ ] **events.controller.ts** - NEEDS AUDIT
  - POST - Instructor/Admin
  - GET /:id - Public or registered users
  - PATCH /:id - Owner or Admin
  - DELETE /:id - Owner or Admin

- [ ] **jobs.controller.ts** - NEEDS AUDIT
  - POST - Recruiter/Admin
  - GET /:id - Public
  - PATCH /:id - Owner or Admin
  - DELETE /:id - Owner or Admin
  - POST /:id/apply - Students only

- [ ] **cms.controller.ts** - NEEDS AUDIT
  - POST - Admin only
  - GET - Public for published pages
  - PATCH /:id - Admin only
  - DELETE /:id - Admin only

### ✅ Communication
- [ ] **chat.controller.ts** - NEEDS AUDIT
  - All endpoints - Authenticated users
  - Room access - Members only
  - Message operations - Sender or Admin

- [ ] **notifications.controller.ts** - NEEDS AUDIT
  - GET - Own notifications only
  - PATCH /:id/read - Own notifications only
  - DELETE /:id - Own notifications only

### ✅ Business & Admin
- [ ] **subscriptions.controller.ts** - NEEDS AUDIT
  - GET - Own subscriptions or Admin
  - POST - User (self) or Admin
  - PATCH /:id - Owner or Admin
  - DELETE /:id - Admin only

- [ ] **plans.controller.ts** - NEEDS AUDIT
  - GET (list) - Public
  - POST - Admin only
  - PATCH /:id - Admin only
  - DELETE /:id - Admin only

- [ ] **payments.controller.ts** - NEEDS AUDIT
  - POST - User (self payment)
  - GET /:id - Owner or Admin
  - GET /history - Own history or Admin

- [ ] **tickets.controller.ts** - NEEDS AUDIT
  - POST - All authenticated users
  - GET /:id - Owner or Admin/Support
  - PATCH /:id - Owner or Admin/Support
  - POST /:id/reply - Owner or Admin/Support

- [ ] **audit.controller.ts** - NEEDS AUDIT
  - GET - Admin/Super Admin only
  - All operations - Read-only for audit trail

### ✅ Advertising
- [ ] **ads.controller.ts** - NEEDS AUDIT
- [ ] **admin-ads.controller.ts** - NEEDS AUDIT
- [ ] **ad-campaigns.controller.ts** - NEEDS AUDIT
- [ ] **ads-tracking.controller.ts** - NEEDS AUDIT

### ✅ Utilities
- [ ] **favorites.controller.ts** - NEEDS AUDIT
  - All operations - Own favorites only

- [ ] **shares.controller.ts** - NEEDS AUDIT
  - POST - All authenticated users
  - GET - Public based on shared resource

- [ ] **lookups.controller.ts** - NEEDS AUDIT
  - GET - Public/Authenticated based on type
  - POST/PATCH/DELETE - Admin only

- [ ] **lookup-types.controller.ts** - NEEDS AUDIT
  - GET - Public
  - POST/PATCH/DELETE - Admin only

## GraphQL Resolvers

- [ ] Audit all GraphQL resolvers for proper `@UseGuards` decorators
- [ ] Ensure field resolvers have authorization
- [ ] Check nested queries for authorization

## gRPC Controllers

- [ ] Add gRPC interceptors for authentication
- [ ] Verify all gRPC methods have proper authorization
- [ ] Test cross-service authorization

## WebSocket Gateways

- [ ] **chat.gateway.ts**
  - Connection authentication ✅
  - Room authorization (members only)
  - Message authorization (sender verification)

- [ ] **notifications.gateway.ts**
  - Connection authentication ✅
  - Subscription authorization (own notifications only)

## Critical Security Patterns

### Pattern 1: Admin-Only Operations
```typescript
@Post()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
create(@Body() dto: CreateDto) { }
```

### Pattern 2: Owner or Admin Operations
```typescript
@Patch(':id')
@Roles(Role.STUDENT, Role.ADMIN, Role.SUPER_ADMIN)
@ResourceType('resource')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
update(@Param('id') id: number, @Body() dto: UpdateDto) { }
```

### Pattern 3: Public with Auth for Actions
```typescript
@Get(':id')
@Public()
findOne(@Param('id') id: number) { }

@Post(':id/like')
@UseGuards(JwtAuthGuard)
like(@Param('id') id: number) { }
```

### Pattern 4: Self-Only Operations
```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
getMe(@CurrentUser() user: any) { }
```

## Next Steps

1. ✅ Complete security guard infrastructure
2. ✅ Create ownership policies for each resource
3. 🔄 Audit and update all controllers (2/33 complete)
4. ⏳ Test authorization with different roles
5. ⏳ Create E2E security tests
6. ⏳ Document public endpoints
7. ⏳ Create security guide for developers

## Testing Checklist

For each controller:
- [ ] Test with no authentication (should fail except public)
- [ ] Test with wrong role (should fail with 403)
- [ ] Test accessing other user's data (should fail)
- [ ] Test as super admin (should succeed)
- [ ] Test as resource owner (should succeed)

## Deployment Blockers

**Critical issues that MUST be fixed before deployment:**
- [ ] All endpoints have authentication (except explicitly public)
- [ ] All role checks use Role enum (not strings)
- [ ] All resource-specific endpoints have ownership checks
- [ ] WebSocket authentication verified
- [ ] GraphQL resolvers have authorization
- [ ] gRPC services have authorization

---

**Priority**: 🔴 CRITICAL - This must be completed before ANY other development work.
