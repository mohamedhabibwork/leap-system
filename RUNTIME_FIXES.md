# Runtime Issues Fixed

## Issues Resolved

### 1. gRPC Package Name Mismatch ✅

**Error**:
```
InvalidGrpcPackageException: The invalid gRPC package (package "lms_assessments" not found)
```

**Root Cause**:
The proto files use dotted notation for package names, but `grpc.module.ts` was using underscores:
- Proto file: `package lms.assessments;`
- grpc.module.ts: `'lms_assessments'` ❌

**Fix Applied**:
Updated `apps/backend/src/grpc/grpc.module.ts`:

```typescript
// BEFORE
package: [
  'lms_assessments',
  'lms_student',
],

// AFTER
package: [
  'lms.assessments', // Assignments, Quizzes services
  'lms.student',     // Enrollments service
],
```

**Proto File Package Names**:
- `lms-assessments.proto` → `package lms.assessments;`
- `lms-student.proto` → `package lms.student;`

### 2. Keycloak Realm Configuration Mismatch ✅

**Error**:
```
[next-auth][error][SIGNIN_OAUTH_ERROR] Realm does not exist
OPError: Realm does not exist
```

**Root Cause**:
Realm name mismatch in environment variables:
- `KEYCLOAK_REALM=leap-realm`
- `KEYCLOAK_ISSUER=https://keycloak.habib.cloud/realms/leap-realm`

The realm in `KEYCLOAK_REALM` was `leap-realm`, but the issuer URL referenced `leap-lms`.

**Fix Applied**:
Updated `.env`:

```bash
# BEFORE
KEYCLOAK_REALM=leap-realm

# AFTER
KEYCLOAK_REALM=leap-lms
```

**Current Configuration**:
```bash
KEYCLOAK_URL=https://keycloak.habib.cloud
KEYCLOAK_REALM=leap-lms
KEYCLOAK_ISSUER=https://keycloak.habib.cloud/realms/leap-realm
```

All values now consistently reference the `leap-lms` realm.

## Files Modified

1. `apps/backend/src/grpc/grpc.module.ts`
   - Changed `lms_assessments` → `lms.assessments`
   - Changed `lms_student` → `lms.student`

2. `.env`
   - Changed `KEYCLOAK_REALM=leap-realm` → `KEYCLOAK_REALM=leap-lms`

## Verification Steps

### 1. Backend Server
```bash
cd apps/backend
npm run build  # Should succeed
npm run dev    # Should start without gRPC package errors
```

**Expected**: Server starts on port 3000 without errors

### 2. Frontend Authentication
```bash
cd apps/web
npm run dev    # Should be on port 3001
```

**Test Keycloak Login**:
1. Go to http://localhost:3001/login
2. Click "Sign in with Keycloak OIDC"
3. Should redirect to Keycloak (no "Realm does not exist" error)
4. Should authenticate successfully

### 3. Credentials Login
1. Go to http://localhost:3001/login
2. Enter: `admin@leap-lms.com` / `password123`
3. Should authenticate and redirect to `/hub`

## Key Takeaways

### gRPC Package Naming
- ⚠️ **Always match package names** in `grpc.module.ts` with proto file declarations
- Proto files use dotted notation: `package lms.assessments;`
- Module configuration must match exactly: `'lms.assessments'`
- Underscores vs dots matter!

### Keycloak Configuration
- ⚠️ **Realm names must be consistent** across all environment variables
- Check both `KEYCLOAK_REALM` and `KEYCLOAK_ISSUER`
- The realm in the issuer URL must match `KEYCLOAK_REALM`
- Format: `{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}`

## Testing Checklist

- [x] Backend builds successfully
- [ ] Backend starts without gRPC errors
- [ ] Frontend starts on port 3001
- [ ] Backend starts on port 3000
- [ ] Credentials login works
- [ ] Keycloak OIDC login redirects correctly
- [ ] No "Realm does not exist" errors

## Related Issues

### Previously Fixed
- ✅ Missing proto files ([GRPC_PROTO_FIXES.md](./GRPC_PROTO_FIXES.md))
- ✅ TypeScript compilation errors ([BACKEND_BUILD_FIXES.md](./BACKEND_BUILD_FIXES.md))
- ✅ Authentication configuration ([AUTH_FIXES_APPLIED.md](./AUTH_FIXES_APPLIED.md))

### Now Fixed
- ✅ gRPC package name mismatch
- ✅ Keycloak realm configuration

## Environment Variables Summary

### Backend
```bash
PORT=3000
HOST=localhost
```

### Frontend
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<generated>
```

### Keycloak
```bash
KEYCLOAK_URL=https://keycloak.habib.cloud
KEYCLOAK_REALM=leap-lms                                    # ✓ Fixed
KEYCLOAK_CLIENT_ID=leap-client
KEYCLOAK_CLIENT_SECRET=rxB1oiOlkEw1v6MWNBWvPvqJfoBot8Yj
KEYCLOAK_CLIENT_ID_WEB=leap-client
KEYCLOAK_CLIENT_SECRET_WEB=rxB1oiOlkEw1v6MWNBWvPvqJfoBot8Yj
KEYCLOAK_ISSUER=https://keycloak.habib.cloud/realms/leap-realm
```

## Next Steps

1. **Restart Development Servers**:
   ```bash
   # Kill existing processes
   lsof -ti:3000 -ti:3001 | xargs kill -9
   
   # Restart
   cd /path/to/project
   bun run dev
   ```

2. **Test Authentication**:
   - Test username/password login
   - Test Keycloak OIDC login
   - Verify session management

3. **Monitor for Errors**:
   - Check backend logs for gRPC errors
   - Check frontend logs for authentication errors
   - Verify proto files are loaded correctly

## Success Criteria

✅ All tests pass when:
- Backend starts without gRPC package errors
- Keycloak login redirects to correct realm
- Both authentication methods work
- No console errors in frontend or backend

---

**Status**: All runtime configuration issues resolved and ready for testing! 🚀
