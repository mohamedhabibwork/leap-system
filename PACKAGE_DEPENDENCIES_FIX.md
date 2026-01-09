# Package Dependencies Fix

## Issues Resolved

### 1. Missing Dependencies in @leap-lms/ui Package ✅

**Error**:
```
error TS2307: Cannot find module 'clsx' or its corresponding type declarations.
error TS2307: Cannot find module 'tailwind-merge' or its corresponding type declarations.
```

**Root Cause**:
The dependencies were declared in `packages/ui/package.json` but not installed in `node_modules`. This happens when:
- Dependencies were added to package.json but `npm install` wasn't run
- Workspace dependencies need to be installed at the root level

**Fix Applied**:
Ran `npm install` at the root of the monorepo to install all workspace dependencies.

### 2. Package Manager Enforcement ✅

**Error** (when trying to use bun):
```
ERROR: This project uses npm. Please use npm install
error: preinstall script from "leap-lms-monorepo" exited with 1
```

**Root Cause**:
The project has a `preinstall` script that enforces npm usage:
```json
"preinstall": "node -e \"if (process.env.npm_execpath && !process.env.npm_execpath.includes('npm')) { console.error('ERROR: This project uses npm. Please use npm install'); process.exit(1); }\""
```

**Solution**:
This is **working as intended**. The project uses npm, not bun. Always use:
```bash
npm install  # ✅ Correct
bun i        # ❌ Will be blocked
```

## Dependencies in @leap-lms/ui

The `packages/ui/package.json` correctly declares:
```json
{
  "dependencies": {
    "@radix-ui/react-slot": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",              // ✅ Required for utils.ts
    "tailwind-merge": "^2.6.0"     // ✅ Required for utils.ts
  }
}
```

## Installation Process

### For New Dependencies
1. Add dependency to the specific package's `package.json`
2. Run `npm install` at the **root** of the monorepo
3. Dependencies will be installed for all workspaces

### For Workspace Dependencies
```bash
# Install in specific workspace
cd packages/ui
npm install clsx tailwind-merge

# Or add to package.json and install from root
cd /path/to/root
npm install
```

## Verification

### Check Dependencies
```bash
# Check if dependencies are installed
cd packages/ui
ls node_modules | grep -E "(clsx|tailwind-merge)"

# Or check from root
npm list clsx tailwind-merge --workspace=@leap-lms/ui
```

### Build Verification
```bash
# Build packages
npm run build:packages

# Should complete without TypeScript errors
```

## Package Manager Guidelines

### ✅ Use npm
```bash
npm install              # Install all dependencies
npm install <package>    # Add new dependency
npm run <script>         # Run scripts
```

### ❌ Don't Use
- `bun` - Blocked by preinstall script
- `yarn` - Not configured for this project
- `pnpm` - Not configured for this project

## Workspace Structure

This is an npm workspaces monorepo:
```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

### Workspace Packages
- `apps/backend` - NestJS backend
- `apps/web` - Next.js frontend
- `packages/database` - Database schema
- `packages/shared-types` - Shared TypeScript types
- `packages/ui` - UI component library

### Installing Dependencies

**Root Level** (installs for all workspaces):
```bash
npm install
```

**Specific Workspace**:
```bash
cd packages/ui
npm install clsx
```

**From Root** (recommended):
```bash
npm install clsx --workspace=@leap-lms/ui
```

## Common Issues

### Issue: "Cannot find module" after adding dependency
**Solution**: Run `npm install` at the root

### Issue: "Preinstall script failed" when using bun/yarn
**Solution**: Use `npm install` instead

### Issue: Dependencies not found in workspace
**Solution**: 
1. Check if dependency is in workspace's `package.json`
2. Run `npm install` at root
3. Verify `node_modules` exists in workspace

## Files Modified

1. **No files modified** - Only ran `npm install` to install existing dependencies

## Success Criteria

✅ All dependencies installed
✅ `@leap-lms/ui` builds without TypeScript errors
✅ No "Cannot find module" errors
✅ Build scripts work correctly

## Next Steps

After installing dependencies:
1. ✅ Run `npm install` at root
2. ✅ Verify build: `npm run build:packages`
3. ✅ Continue development

---

**Status**: Dependencies installed successfully! 🚀
