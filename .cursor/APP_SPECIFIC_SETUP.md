# App-Specific Cursor Setup

Complete Cursor configuration for each application with clean code focus.

## 📁 Structure

```
apps/
├── backend/
│   └── .cursor/
│       ├── rules/
│       │   └── clean-code-nestjs.mdc
│       ├── commands/
│       │   ├── refactor-service.md
│       │   └── create-service-layer.md
│       ├── skills/
│       │   └── clean-code-patterns.md
│       └── hooks.json
│
└── web/
    └── .cursor/
        ├── rules/
        │   └── clean-code-nextjs.mdc
        ├── commands/
        │   ├── refactor-component.md
        │   └── create-component.md
        ├── skills/
        │   └── clean-code-patterns.md
        └── hooks.json
```

## 🎯 Backend (NestJS) Configuration

### Rules
- **`clean-code-nestjs.mdc`** - Comprehensive clean code principles for NestJS
  - Single Responsibility Principle
  - Meaningful names
  - Small functions
  - Error handling
  - Code organization
  - Testing patterns

### Commands
- **`/refactor-service`** - Refactor NestJS service to follow clean code
- **`/create-service-layer`** - Create complete service layer with clean code

### Skills
- **`clean-code-patterns.md`** - Specialized clean code patterns
  - Service layer patterns
  - Repository patterns
  - Error handling patterns
  - Validation patterns
  - Testing patterns

### Hooks
- Format code after edits
- Lint code after edits
- Type check after edits
- Run tests on completion
- Full checks before commit

## 🎨 Frontend (Next.js) Configuration

### Rules
- **`clean-code-nextjs.mdc`** - Comprehensive clean code principles for Next.js
  - Component single responsibility
  - Meaningful names
  - Custom hooks extraction
  - Component composition
  - Server/Client separation
  - Performance optimization

### Commands
- **`/refactor-component`** - Refactor React component to follow clean code
- **`/create-component`** - Create component with clean code principles

### Skills
- **`clean-code-patterns.md`** - Specialized clean code patterns
  - Component patterns
  - Hook patterns
  - Data fetching patterns
  - Error handling patterns
  - Performance patterns
  - State management patterns

### Hooks
- Format code after edits
- Lint code after edits
- Type check after edits
- Run tests on completion
- Check Next.js build
- Full checks before commit

## 🧹 Clean Code Principles Applied

### Backend (NestJS)
1. **Single Responsibility** - Each class has one reason to change
2. **Small Functions** - Methods under 30 lines
3. **Meaningful Names** - Intention-revealing names
4. **No Duplication** - DRY principle
5. **Error Handling** - Custom exceptions with meaningful messages
6. **Type Safety** - Strict TypeScript, no `any`
7. **Testing** - Unit and integration tests
8. **SOLID Principles** - All SOLID principles followed

### Frontend (Next.js)
1. **Component Focus** - Components under 300 lines
2. **Hook Extraction** - Logic extracted to custom hooks
3. **Composition** - Small, composable components
4. **Type Safety** - Proper TypeScript interfaces
5. **Performance** - Memoization and optimization
6. **Error Handling** - Error boundaries and proper states
7. **Server/Client Separation** - Clear boundaries
8. **Accessibility** - WCAG compliance

## 📋 Usage

### Backend Commands
Type `/` in Cursor chat when working in `apps/backend`:
- `/refactor-service` - Refactor a service
- `/create-service-layer` - Create new service layer

### Frontend Commands
Type `/` in Cursor chat when working in `apps/web`:
- `/refactor-component` - Refactor a component
- `/create-component` - Create new component

### Automatic Hooks
Hooks run automatically:
- After file edits: Format, lint, type check
- Before commits: Full quality checks
- On task completion: Tests and validation

## ✅ Clean Code Checklist

### Backend
- [ ] Services have single responsibility
- [ ] Methods are small (<30 lines)
- [ ] No code duplication
- [ ] Meaningful names
- [ ] Proper error handling
- [ ] Type safety (no `any`)
- [ ] Tests written
- [ ] SOLID principles followed

### Frontend
- [ ] Components are small (<300 lines)
- [ ] Logic extracted to hooks
- [ ] Clear prop types
- [ ] Proper error handling
- [ ] Performance optimized
- [ ] Server/Client separation
- [ ] Accessible
- [ ] Tests written

## 🔄 Integration with Global Rules

App-specific rules work alongside global rules:
- Global rules provide project-wide conventions
- App-specific rules provide technology-specific guidance
- Both apply automatically based on file paths
- App-specific rules take precedence for app files

## 📚 Documentation

- Backend patterns: `apps/backend/.cursor/skills/clean-code-patterns.md`
- Frontend patterns: `apps/web/.cursor/skills/clean-code-patterns.md`
- Global setup: `.cursor/CURSOR_SETUP_COMPLETE.md`
- Quick start: `.cursor/QUICK_START.md`

---

**Status**: ✅ Complete
**Last Updated**: 2025-01-XX
