# Cursor Rules Documentation

This directory contains comprehensive coding standards and best practices for the LeapV2 Learning Management System.

## 📚 Overview

These rules enforce consistent code quality, architecture patterns, and best practices across our full-stack TypeScript application.

### 📂 App-Specific Rules
- `apps/web/.cursorrules` - Frontend (Next.js) specific rules
- `apps/backend/.cursorrules` - Backend (NestJS) specific rules
- These provide quick reference for each application

## 🎯 Rule Categories

### Frontend Rules

#### 1. **Next.js 16 Best Practices** (`nextjs-16-best-practices.mdc`)
- App Router fundamentals
- Server Components vs Client Components
- Data fetching strategies
- Loading and error states
- Route organization
- Metadata and SEO
- Server Actions
- Caching strategies

**Applies to**: `app/**/*.ts`, `app/**/*.tsx`

#### 2. **TanStack Query Rules** (`tanstack-query-rules.mdc`)
- Query and mutation patterns
- Cache management
- Custom hooks creation
- Error handling
- Performance optimization
- Best practices for server state

**Applies to**: `**/*.ts`, `**/*.tsx`, `**/hooks/**/*.ts`

#### 3. **Zustand State Management** (`zustand-state-management.mdc`)
- Store structure and organization
- Selectors and performance
- Middleware usage
- State updates
- Integration with TanStack Query
- Client state patterns

**Applies to**: `**/stores/**/*.ts`, `**/*.ts`, `**/*.tsx`

#### 4. **Clean Code & SOLID - Frontend** (`clean-code-solid-frontend.mdc`)
- SOLID principles for React
- Component design patterns
- Naming conventions
- Code organization
- Performance optimization
- Testing strategies

**Applies to**: `**/*.ts`, `**/*.tsx`, `components/**/*.tsx`, `app/**/*.tsx`, `lib/**/*.ts`

#### 5. **Reusable Components** (`reusable-components.mdc`)
- Compound components
- Render props
- Polymorphic components
- Controlled/uncontrolled patterns
- Generic list components
- Factory patterns
- Container/presentational patterns
- Headless components

**Applies to**: `components/**/*.tsx`, `**/*.tsx`

#### 6. **TypeScript Best Practices** (`typescript.mdc`)
- Type system fundamentals
- Naming conventions
- Advanced type patterns
- Generics
- Type guards
- Utility types
- React-specific TypeScript

**Applies to**: `**/*.ts`, `**/*.tsx`, `**/*.d.ts`

#### 7. **UI Component & Styling** (`ui-component-styling-rules.mdc`)
- Shadcn UI usage
- Radix UI patterns
- Tailwind CSS conventions
- Responsive design
- Mobile-first approach

**Applies to**: `components/**/*.{js,jsx,ts,tsx}`

#### 8. **React Server Components** (`next-js-server-component-rules.mdc`)
- RSC best practices
- Client component boundaries
- Suspense usage
- Data fetching in RSC

**Applies to**: `app/**/*.tsx`

### Backend Rules

#### 9. **NestJS Clean Code & SOLID** (`nestjs-clean-code-solid.mdc`)
- SOLID principles for NestJS
- Service layer patterns
- Controller design
- Repository pattern
- DTOs and validation
- Module organization
- Guards and middleware
- Error handling
- Testing strategies
- Configuration management
- Logging
- Performance
- Security

**Applies to**: `apps/backend/**/*.ts`, `**/modules/**/*.ts`, `**/services/**/*.ts`, `**/controllers/**/*.ts`

### General Rules

#### 10. **General Project Rules** (`general-project-rules.mdc`)
- Tech stack overview
- Code organization
- File naming conventions
- Code quality principles
- State management strategy
- Testing approach
- Performance guidelines
- Accessibility requirements
- Security practices

**Applies to**: `**/*.*`

#### 11. **Internationalization (i18n)** (`internationalization-i18n.mdc`)
- No hardcoded text allowed
- Support for Arabic (RTL) and English (LTR)
- Translation key naming conventions
- next-intl for frontend, i18next for backend
- Pluralization and formatting
- RTL support

**Applies to**: `**/*.tsx`, `**/*.ts`

#### 12. **Build Validation** (`build-validation.mdc`)
- Pre-commit hooks with Husky
- Type checking before commit
- Linting enforcement
- Build validation before push
- CI/CD pipeline setup
- VS Code auto-validation

**Applies to**: `**/*.ts`, `**/*.tsx`

#### 13. **Environment Configuration** (`environment-config.mdc`)
- Never use process.env.* directly
- Centralized config with Zod validation
- Type-safe configuration
- Separate frontend/backend config
- Environment file management

**Applies to**: `**/*.ts`, `**/*.tsx`, `apps/**/*.ts`

#### 14. **Backend Route Validation** (`backend-route-validation.mdc`)
- Check routes exist before using
- OpenAPI/Swagger documentation
- Type-safe API client generation
- Route existence checking
- API contract testing

**Applies to**: `apps/backend/**/*.ts`, `apps/web/**/*.ts`

## 🚀 Quick Reference

### State Management Decision Tree

```
Is this server data (from API/database)?
├─ Yes → Use TanStack Query
└─ No → Is this UI state?
    ├─ Yes → Use Zustand
    └─ No → Is this URL state?
        ├─ Yes → Use Next.js router
        └─ No → Use local component state
```

### Component Type Decision Tree

```
Does component need interactivity?
├─ No → Server Component (default)
└─ Yes → Does it need browser APIs or React hooks?
    ├─ Yes → Client Component ('use client')
    └─ No → Server Component with Server Actions
```

### File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Component | `component-name.tsx` | `course-card.tsx` |
| Hook | `use-hook-name.ts` | `use-courses.ts` |
| Store | `store-name.store.ts` | `notification.store.ts` |
| Service | `service-name.service.ts` | `email.service.ts` |
| Controller | `resource.controller.ts` | `course.controller.ts` |
| Module | `resource.module.ts` | `course.module.ts` |
| Types | `name.types.ts` | `api.types.ts` |
| Utils | `util-name.ts` | `format-date.ts` |

## 📋 Code Quality Checklist

### Frontend
- [ ] Using TanStack Query for all server state
- [ ] Using Zustand only for client state
- [ ] Server Components by default, Client Components when necessary
- [ ] Proper TypeScript types (no `any`)
- [ ] Components under 200 lines
- [ ] Functions under 20 lines
- [ ] Following SOLID principles
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Accessibility considerations
- [ ] Responsive design
- [ ] Performance optimized

### Backend
- [ ] SOLID principles applied
- [ ] Services contain business logic
- [ ] Controllers are thin
- [ ] DTOs for validation
- [ ] Custom exceptions used
- [ ] Repository pattern for data access
- [ ] Proper dependency injection
- [ ] Error handling implemented
- [ ] Logging added
- [ ] Tests written
- [ ] Security considerations

## 🔍 Common Patterns

### Frontend

#### Custom Hook for API
```typescript
export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchCourses(),
    staleTime: 5 * 60 * 1000,
  });
};
```

#### Zustand Store
```typescript
export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
}));
```

#### Server Component
```typescript
export default async function CoursePage({ params }: { params: { id: string } }) {
  const course = await fetchCourse(params.id);
  return <CourseDetails course={course} />;
}
```

#### Client Component
```typescript
'use client';

export function EnrollButton({ courseId }: { courseId: string }) {
  const { mutate } = useEnrollCourse();
  return <Button onClick={() => mutate(courseId)}>Enroll</Button>;
}
```

### Backend

#### Controller
```typescript
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
  
  @Post()
  async createCourse(@Body() dto: CreateCourseDto): Promise<CourseResponseDto> {
    return this.courseService.createCourse(dto);
  }
}
```

#### Service
```typescript
@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly notificationService: NotificationService,
  ) {}
  
  async createCourse(dto: CreateCourseDto): Promise<Course> {
    const course = await this.courseRepository.create(dto);
    await this.notificationService.notifyCourseCreated(course);
    return course;
  }
}
```

#### Repository
```typescript
@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  async findById(id: string): Promise<Course | null> {
    return this.prisma.course.findUnique({ where: { id } });
  }
}
```

## 🛠️ Tools & Configuration

### Required Extensions
- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense

### TypeScript Config
- Strict mode enabled
- No implicit any
- Strict null checks
- No unused locals/parameters

### Recommended VS Code Settings
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.preferences.quoteStyle": "single",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

## 📖 Additional Resources

### Documentation
- [Next.js 16 Docs](https://nextjs.org/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [NestJS Docs](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Internal Docs
- See `/docs` directory for project-specific documentation
- Check DEVELOPMENT_GUIDE.md for setup instructions
- Review IMPLEMENTATION_TEMPLATE.md for feature development

## 🤝 Contributing

When adding new rules:
1. Follow the existing `.mdc` format
2. Include clear examples (Good/Bad)
3. Add file glob patterns
4. Update this README
5. Add entry to the appropriate category

## 📝 Notes

- Rules are enforced by Cursor AI during development
- Rules help maintain consistency across the codebase
- Update rules as best practices evolve
- Share learnings with the team

## 🔄 Last Updated

January 10, 2026

---

For questions or suggestions about these rules, please contact the development team or create an issue in the project repository.
