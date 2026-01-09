# Turbo Workspace Flag Fix

## Issue

**Error**:
```
ERROR  unexpected argument '--workspace' found
  tip: to pass '--workspace' as a value, use '-- --workspace'
```

**Root Cause**:
The build scripts in `package.json` were using npm's `--workspace` flag, which is not supported by Turbo. Turbo uses its own `--filter` syntax for selecting packages in a monorepo.

## Solution

### Changed Scripts

**File**: `package.json`

**Before** (using npm workspace syntax):
```json
{
  "scripts": {
    "build:packages": "npm run build --workspace=@leap-lms/database --workspace=@leap-lms/shared-types --workspace=@leap-lms/ui",
    "build:backend": "npm run build --workspace=@leap-lms/backend",
    "build:web": "npm run build --workspace=web"
  }
}
```

**After** (using turbo filter syntax):
```json
{
  "scripts": {
    "build:packages": "npx turbo run build --filter=@leap-lms/database --filter=@leap-lms/shared-types --filter=@leap-lms/ui",
    "build:backend": "npx turbo run build --filter=@leap-lms/backend",
    "build:web": "npx turbo run build --filter=web"
  }
}
```

## Key Differences

### npm Workspace Syntax
```bash
npm run build --workspace=@leap-lms/database
```
- Uses `--workspace` flag
- Multiple workspaces: `--workspace=package1 --workspace=package2`
- Works with npm workspaces directly

### Turbo Filter Syntax
```bash
npx turbo run build --filter=@leap-lms/database
```
- Uses `--filter` flag
- Multiple filters: `--filter=package1 --filter=package2`
- Works with Turbo's task runner
- Respects Turbo's dependency graph and caching

## Benefits of Using Turbo Filters

1. **Caching**: Turbo can cache build outputs
2. **Parallel Execution**: Turbo runs tasks in parallel when possible
3. **Dependency Awareness**: Turbo understands package dependencies
4. **Incremental Builds**: Only rebuilds what changed
5. **Consistent**: Uses the same task runner as other scripts

## Verification

### Test the Fix
```bash
# Build packages
npm run build:packages

# Build backend
npm run build:backend

# Build web
npm run build:web

# Build all
npm run build:all
```

**Expected Output**:
```
• turbo 2.7.3
• Packages in scope: @leap-lms/database, @leap-lms/shared-types, @leap-lms/ui
• Running build in 3 packages
```

## Turbo Filter Syntax Reference

### Single Package
```bash
npx turbo run build --filter=package-name
```

### Multiple Packages
```bash
npx turbo run build --filter=package1 --filter=package2 --filter=package3
```

### All Packages
```bash
npx turbo run build
```

### Packages with Dependencies
```bash
npx turbo run build --filter=package-name^...
```

### Packages and Dependents
```bash
npx turbo run build --filter=...package-name
```

## Related Scripts

All scripts now use Turbo consistently:
- ✅ `dev` - Uses `npx turbo run dev`
- ✅ `build` - Uses `npx turbo run build`
- ✅ `build:packages` - Uses `npx turbo run build --filter=...`
- ✅ `build:backend` - Uses `npx turbo run build --filter=@leap-lms/backend`
- ✅ `build:web` - Uses `npx turbo run build --filter=web`
- ✅ `lint` - Uses `npx turbo run lint`
- ✅ `test` - Uses `npx turbo run test`

## Notes

### Turbo Version Warning
You may see this warning:
```
WARNING  No locally installed `turbo` found in your repository. 
Using globally installed version (2.7.3), which can cause unexpected behavior.
```

**Solution**: Install turbo locally:
```bash
npm install turbo@^2.3.3 --save-dev
```

Or update to match the global version:
```bash
npm install turbo@^2.7.3 --save-dev
```

### Package Manager
This project uses **npm** as the package manager (not yarn or pnpm), so:
- ✅ Use `npm run <script>`
- ✅ Use Turbo's `--filter` syntax for package selection
- ❌ Don't use npm's `--workspace` flag with Turbo commands

## Files Modified

1. `package.json`
   - Updated `build:packages` script
   - Updated `build:backend` script
   - Updated `build:web` script

## Success Criteria

✅ All build scripts work without errors
✅ Turbo correctly identifies packages in scope
✅ Builds execute in parallel when possible
✅ No "unexpected argument '--workspace'" errors

---

**Status**: Fixed! All build scripts now use Turbo's filter syntax correctly. 🚀
