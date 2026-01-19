# Cursor Quick Start Guide

Quick reference for using Cursor rules, commands, skills, and hooks.

## 🎯 Commands (Type `/` in chat)

### Backend Development
- `/setup-nestjs-module` - Create complete NestJS module structure
- `/create-crud-endpoints` - Generate full CRUD with frontend integration

### Frontend Development
- `/setup-nextjs-page` - Scaffold Next.js page with components
- `/generate-api-client` - Create API client and TanStack Query hooks
- `/add-internationalization` - Add i18n support (EN/AR)
- `/refactor-component` - Refactor React components

### Quality & Security
- `/run-tests` - Run tests and fix failures
- `/security-audit` - Comprehensive security checklist

## 📖 Skills

Skills are automatically available. They provide expertise in:

- **NestJS**: Architecture, DI, repositories, testing, security
- **Next.js**: Server/Client components, routing, state management, SEO

## 🔗 Hooks (Automatic)

Hooks run automatically:
- ✅ Format code after edits
- ✅ Type check after edits
- ✅ Run tests on task completion
- ✅ Lint before commits

## 📋 Rules

Rules apply automatically based on:
- File patterns (globs)
- Always apply settings
- Agent intelligence

Key rules:
- `nestjs-clean-code-solid.mdc` - Backend best practices
- `nextjs-16-best-practices.mdc` - Frontend best practices
- `tanstack-query-rules.mdc` - Data fetching patterns
- `zustand-state-management.mdc` - Client state patterns

## 💡 Tips

1. **Use commands for repetitive tasks** - They scaffold complete structures
2. **Skills provide context** - Agent knows NestJS/Next.js patterns
3. **Hooks maintain quality** - Code is automatically checked
4. **Rules guide decisions** - Follow project conventions automatically

## 🚀 Example Workflow

1. Create new feature: `/setup-nestjs-module`
2. Generate API client: `/generate-api-client`
3. Create frontend page: `/setup-nextjs-page`
4. Add translations: `/add-internationalization`
5. Run tests: `/run-tests`
6. Security check: `/security-audit`

---

For detailed documentation, see:
- `.cursor/CURSOR_SETUP_COMPLETE.md` - Complete setup guide
- `.cursor/rules/README.md` - Rules documentation
- `.cursor/skills/` - Skills documentation
