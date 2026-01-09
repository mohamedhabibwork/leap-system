# Build and Run Guide

## Overview
This is a monorepo containing a NestJS backend and Next.js frontend, with shared packages for database, types, UI components, and configuration.

## Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

## Package Manager
This project **MUST** use npm. Yarn, pnpm, and bun are not supported.

## Project Structure
```
leapv2-system/
├── apps/
│   ├── backend/          # NestJS API server
│   └── web/              # Next.js frontend
├── packages/
│   ├── config/           # Shared TypeScript config
│   ├── database/         # Drizzle ORM + PostgreSQL schemas  
│   ├── shared-types/     # Shared TypeScript types
│   └── ui/               # Shared UI components
└── package.json          # Root workspace config
```

## Installation

### Clean Install (Recommended for first time or after major changes)
```bash
npm run clean:all  # Remove all node_modules, dist, and lock files
npm install        # Install all dependencies
```

### Standard Install
```bash
npm install
```

## Build Commands

### Build Everything
```bash
npm run build              # Build all packages and apps (using Turbo)
npm run build:all          # Build in specific order: packages → backend → web
```

### Build Packages Only
```bash
npm run build:packages     # Build internal packages (database, shared-types, ui)
```

### Build Individual Apps
```bash
npm run build:backend      # Build NestJS backend
npm run build:web          # Build Next.js frontend
```

## Development

### Start All Services
```bash
npm run dev                # Start all services in watch mode
```

### Start Individual Services
```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend  
cd apps/web
npm run dev
```

## Important Notes

### Build Order
The build order is critical:
1. **Packages** must be built first (`database`, `shared-types`, `ui`)
2. **Backend** depends on built packages
3. **Frontend** can be built independently

### TypeScript Configuration
- Backend references **built packages** (`dist` folders)
- This avoids TypeScript `rootDir` conflicts
- Packages must be rebuilt after schema or type changes

### Incremental Builds
- Set `incremental: false` in backend tsconfig to avoid build cache issues
- Clean builds recommended after major changes

## Database Commands

```bash
npm run db:generate        # Generate Drizzle migrations
npm run db:push            # Push schema changes to database
npm run db:migrate         # Run migrations
npm run db:studio          # Open Drizzle Studio
npm run seed               # Seed database
npm run seed:reset         # Reset and reseed database
```

## Cleaning

```bash
npm run clean              # Clean all build outputs (via Turbo)
npm run clean:all          # Deep clean: remove node_modules, dist, .next, etc.
npm run reinstall          # Clean all + fresh install
```

## Linting & Formatting

```bash
npm run lint               # Lint all packages
npm run format             # Format code with Prettier
```

## Testing

```bash
npm test                   # Run all tests
```

## Production

### Build for Production
```bash
npm run build:all
```

### Start Backend in Production
```bash
cd apps/backend
npm run start:prod
```

### Start Frontend in Production
```bash
cd apps/web
npm start
```

## Troubleshooting

### "Cannot find module '@leap-lms/database'" 
- Run `npm run build:packages` to build internal packages

### Backend build fails with "not under rootDir"
- Ensure `rootDir: "./src"` is set in backend tsconfig.json
- Packages are referenced via their `dist` folders

### No .js files in dist after build
- Set `incremental: false` in tsconfig.json
- Run clean build: `rm -rf dist && npm run build`

### Mixed package manager errors
- Remove yarn.lock, pnpm-lock.yaml, bun.lock
- Use only npm: `npm install`

### Stale build cache
```bash
npm run clean:all
npm install
npm run build:all
```

## Architecture

### Monorepo Setup
- Uses npm workspaces for package management
- Turborepo for build orchestration
- Shared TypeScript configuration

### Backend (NestJS)
- REST API + GraphQL
- WebSocket support
- PostgreSQL with Drizzle ORM
- Keycloak authentication
- Redis caching
- S3/MinIO storage

### Frontend (Next.js 14+)
- App Router architecture
- React Server Components
- Shadcn UI + Radix UI + Tailwind
- Apollo Client for GraphQL
- Socket.io client

### Shared Packages
- **@leap-lms/database**: Database schemas and client
- **@leap-lms/shared-types**: Common TypeScript types
- **@leap-lms/ui**: Reusable UI components
- **@leap-lms/config**: Shared configurations

## Environment Variables
Copy `env.example` to `.env` and configure:
- Database connection
- Keycloak settings
- Redis connection
- S3/MinIO credentials
- API keys

## Support
For issues or questions, check:
1. This guide's Troubleshooting section
2. Project documentation in `/docs`
3. Package-specific README files
