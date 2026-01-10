# Security Implementation - Quick Start Guide

## 🎯 Overview

This guide provides a quick start for implementing security on your LMS platform controllers. The security infrastructure has been fully implemented and tested on 4 controllers. Follow these patterns to secure the remaining 43 controllers.

## ✅ What's Already Done

- ✅ Role-Based Access Control (RBAC) with hierarchy
- ✅ Resource ownership verification system
- ✅ Super admin bypass logic
- ✅ Custom security exceptions
- ✅ Authorization policies framework
- ✅ Security audit tools
- ✅ 4 example controllers fully secured

## 🚀 Quick Implementation Guide

### Step 1: Import Required Dependencies

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResourceOwnerGuard } from '../../common/guards/resource-owner.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { ResourceType, SkipOwnership } from '../../common/decorators/resource-type.decorator';
import { Public } from '../../common/decorators/public.decorator';
```

### Step 2: Apply Guards to Controller

```typescript
@Controller('resource')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
@ApiBearerAuth()
export class ResourceController {
  // Your endpoints here
}
```

### Step 3: Secure Each Endpoint

#### For CREATE endpoints:
```typescript
@Post()
@Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
create(@Body() dto: CreateDto) {
  return this.service.create(dto);
}
```

#### For LIST endpoints (public):
```typescript
@Get()
@Public()
@SkipOwnership()
findAll() {
  return this.service.findAll();
}
```

#### For GET by ID (with ownership):
```typescript
@Get(':id')
@ResourceType('resource')
findOne(@Param('id') id: number) {
  return this.service.findOne(id);
}
```

#### For UPDATE (owner only):
```typescript
@Patch(':id')
@Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
@ResourceType('resource')
update(@Param('id') id: number, @Body() dto: UpdateDto) {
  return this.service.update(id, dto);
}
```

#### For DELETE (admin only):
```typescript
@Delete(':id')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ResourceType('resource')
remove(@Param('id') id: number) {
  return this.service.remove(id);
}
```

## 📋 Common Patterns

### Pattern 1: Admin-Only Operation
```typescript
@Post()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
adminOnlyAction() { }
```

### Pattern 2: Owner or Admin
```typescript
@Patch(':id')
@Roles(Role.STUDENT, Role.ADMIN, Role.SUPER_ADMIN)
@ResourceType('resource')
update() { }
```

### Pattern 3: Public Read, Auth for Actions
```typescript
@Get(':id')
@Public()
@ResourceType('resource')  // Still check ownership for drafts
view() { }

@Post(':id/like')
@UseGuards(JwtAuthGuard)  // Auth required
like() { }
```

### Pattern 4: Instructor Access to Their Resources
```typescript
@Get('by-course/:courseId')
@Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
@SkipOwnership()  // Check in service layer
getByCourse() { }
```

## 🎯 Decision Tree

```
Is endpoint public?
├─ Yes → Use @Public() and @SkipOwnership()
└─ No → Requires auth
    ├─ Admin only?
    │   └─ @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    ├─ Specific role?
    │   └─ @Roles(Role.XXX, Role.SUPER_ADMIN)
    └─ Any authenticated user?
        └─ Just use JwtAuthGuard

Does endpoint access specific resource by ID?
├─ Yes → Add @ResourceType('resourceName')
└─ No → Add @SkipOwnership()
```

## ✅ Checklist for Each Controller

- [ ] Import all required dependencies
- [ ] Apply guard stack to controller
- [ ] Replace string roles with Role enum
- [ ] Add @ResourceType() to resource-specific endpoints
- [ ] Add @SkipOwnership() to list/search endpoints
- [ ] Mark public routes with @Public()
- [ ] Update Swagger annotations
- [ ] Test with different roles
- [ ] Check off in SECURITY_AUDIT_CHECKLIST.md

## 🧪 Testing Each Controller

After securing a controller, test:

```bash
# 1. No auth (should fail except public)
curl http://localhost:3000/api/v1/resource

# 2. Wrong role (should fail with 403)
curl -H "Authorization: Bearer <student_token>" \
  http://localhost:3000/api/v1/resource

# 3. Not owner (should fail with 403)
curl -H "Authorization: Bearer <user2_token>" \
  http://localhost:3000/api/v1/resource/user1-resource-id

# 4. As owner (should succeed)
curl -H "Authorization: Bearer <owner_token>" \
  http://localhost:3000/api/v1/resource/their-resource-id

# 5. As super admin (should succeed)
curl -H "Authorization: Bearer <super_admin_token>" \
  http://localhost:3000/api/v1/resource/any-resource-id
```

## 📚 Reference Documentation

- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **API Audit**: `BACKEND_API_AUDIT.md`
- **Security Checklist**: `SECURITY_AUDIT_CHECKLIST.md`
- **Completion Report**: `PHASE_0_COMPLETION_REPORT.md`
- **Audit Script**: `apps/backend/src/scripts/security-audit.ts`

## 🔥 Example Controllers (Fully Secured)

Study these for reference:
1. `apps/backend/src/modules/lms/courses/courses.controller.ts`
2. `apps/backend/src/modules/users/users.controller.ts`
3. `apps/backend/src/modules/lms/enrollments/enrollments.controller.ts`
4. `apps/backend/src/modules/notifications/notifications.controller.ts`

## 🎓 Role Hierarchy Reference

```
Role.SUPER_ADMIN (4)  → Can access everything
  ↓
Role.ADMIN (3)        → Platform management
  ↓
Role.INSTRUCTOR (2)   → Own courses & students
Role.RECRUITER (2)    → Job postings
  ↓
Role.STUDENT (1)      → Own enrollments & submissions
```

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T:
```typescript
// Using string roles
@Roles('admin', 'instructor')  // BAD

// Missing ResourceType
@Patch(':id')  // BAD - no ownership check
update() { }

// Forgetting SkipOwnership on lists
@Get()  // BAD - will try ownership check on undefined ID
findAll() { }
```

### ✅ DO:
```typescript
// Use Role enum
@Roles(Role.ADMIN, Role.INSTRUCTOR)  // GOOD

// Add ResourceType
@Patch(':id')
@ResourceType('course')  // GOOD
update() { }

// Skip ownership on lists
@Get()
@SkipOwnership()  // GOOD
findAll() { }
```

## 🚀 Getting Started

1. Pick a controller from `SECURITY_AUDIT_CHECKLIST.md`
2. Follow the patterns above
3. Test with different roles
4. Check off in the checklist
5. Repeat for next controller

## 💡 Pro Tips

1. **Super Admin**: Always include `Role.SUPER_ADMIN` in @Roles()
2. **Public Routes**: Must explicitly use `@Public()`
3. **List Endpoints**: Always use `@SkipOwnership()`
4. **Ownership**: Let the guard handle it with `@ResourceType()`
5. **Testing**: Test as 5 different users (no auth, wrong role, not owner, owner, super admin)

## 📞 Need Help?

- Check existing secured controllers for patterns
- Review `IMPLEMENTATION_SUMMARY.md` for details
- Run security audit script: `ts-node src/scripts/security-audit.ts`
- All tools and documentation are in place!

---

**Remember**: Security first! Complete the audit before adding new features.

**Goal**: Secure all 47 controllers (4 done, 43 to go)  
**Timeline**: 2-3 weeks at 5-10 controllers per day  
**Priority**: 🔴 CRITICAL - Block production deployment until complete
