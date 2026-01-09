# LEAP PM - Development Guide

## 🎯 Project Status

### ✅ Completed Foundation (6/29 TODOs)
- [x] Monorepo setup with Turborepo
- [x] Docker infrastructure (PostgreSQL, Redis, Kafka, RabbitMQ, MinIO, Keycloak)
- [x] Complete database schemas (40+ tables across 18 modules)
- [x] NestJS backend scaffold
- [x] Authentication module (JWT + Passport)
- [x] Lookups module (foundation for enums)

### 🚧 Remaining Work (23 TODOs)

#### Backend Modules (13 modules)
- [ ] Users Module
- [ ] Subscriptions Module
- [ ] Payments Module (PayPal)
- [ ] Notifications Module (FCM/Email/DB)
- [ ] Media Module (S3/MinIO)
- [ ] LMS Module (courses, lessons, quizzes, certificates)
- [ ] Comments & Notes Modules
- [ ] Social Module (posts, groups, pages, friends)
- [ ] Chat Module (WebSocket)
- [ ] Events Module
- [ ] Jobs Module
- [ ] Favorites & Shares Modules
- [ ] Ticketing Module
- [ ] CMS Module
- [ ] Audit Module

#### Infrastructure & APIs
- [ ] GraphQL setup
- [ ] gRPC setup  
- [ ] WebSocket gateways
- [ ] RabbitMQ integration
- [ ] Kafka integration

#### Frontend
- [ ] Next.js 15 scaffold
- [ ] NextAuth.js integration
- [ ] All pages (landing, dashboard, courses, social, etc.)

#### Data & Testing
- [ ] Comprehensive seeders
- [ ] Testing infrastructure

---

## 📚 Implementation Patterns

### Pattern 1: Backend Module Template

Every backend module follows this structure:

```
src/modules/{module-name}/
├── {module-name}.module.ts       # NestJS module
├── {module-name}.service.ts      # Business logic
├── {module-name}.controller.ts   # REST endpoints
├── dto/
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   └── index.ts
└── entities/
    └── {entity}.entity.ts (optional)
```

#### Example: Users Module

**1. Create Directory Structure**
```bash
cd apps/backend
mkdir -p src/modules/users/{dto,entities}
```

**2. users.module.ts**
```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

**3. users.service.ts**
```typescript
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { users } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  async findAll() {
    return this.db
      .select()
      .from(users)
      .where(eq(users.isDeleted, false));
  }

  async findOne(id: number) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.isDeleted, false)))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: number, data: any) {
    const [updated] = await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { passwordHash, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async remove(id: number) {
    const [deleted] = await this.db
      .update(users)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { message: 'User deleted successfully' };
  }
}
```

**4. users.controller.ts**
```typescript
import { Controller, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('sub') userId: number) {
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(+id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

**5. Add to app.module.ts**
```typescript
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // ... existing imports
    UsersModule,
  ],
})
export class AppModule {}
```

---

### Pattern 2: GraphQL Integration

**1. Install Dependencies** (already done)
```bash
npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

**2. Update main.ts to enable GraphQL**
```typescript
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';

// In AppModule imports:
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: 'src/graphql/schema.gql',
  sortSchema: true,
  playground: true,
}),
```

**3. Create GraphQL Resolver**
```typescript
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver('User')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query('users')
  async getUsers() {
    return this.usersService.findAll();
  }

  @Query('user')
  async getUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation('updateUser')
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: any,
  ) {
    return this.usersService.update(id, data);
  }
}
```

---

### Pattern 3: WebSocket Gateway

**1. Create Gateway**
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any) {
    this.server.emit('message', payload);
    return { event: 'message', data: payload };
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: any) {
    client.broadcast.emit('typing', payload);
  }
}
```

---

### Pattern 4: RabbitMQ Queue Setup

**1. Create Queue Service**
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class QueueService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    this.connection = await amqp.connect(
      process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
    );
    this.channel = await this.connection.createChannel();
  }

  async publishToQueue(queue: string, message: any) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }

  async consumeQueue(queue: string, callback: (msg: any) => void) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        this.channel.ack(msg);
      }
    });
  }
}
```

---

### Pattern 5: Database Seeder Template

**1. Create Seeder**
```typescript
// src/database/seeders/users.seeder.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, lookups } from '@leap-lms/database';
import * as bcrypt from 'bcrypt';

export async function seedUsers() {
  const connectionString = process.env.DATABASE_URL || 
    'postgresql://postgres:@localhost:5432/leap_lms';
  
  const queryClient = postgres(connectionString);
  const db = drizzle(queryClient);

  console.log('🌱 Seeding users...');

  // Get role lookups
  const roles = await db.select().from(lookups).where(/* role lookup type */);

  const adminRole = roles.find(r => r.code === 'ROLE_ADMIN');
  const userRole = roles.find(r => r.code === 'ROLE_USER');
  const instructorRole = roles.find(r => r.code === 'ROLE_INSTRUCTOR');

  const usersData = [
    {
      username: 'admin',
      email: 'admin@leappm.com',
      passwordHash: await bcrypt.hash('Admin123!', 10),
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id,
      statusId: 1,
      isActive: true,
      preferredLanguage: 'en',
    },
    {
      username: 'instructor',
      email: 'instructor@leappm.com',
      passwordHash: await bcrypt.hash('Instructor123!', 10),
      firstName: 'John',
      lastName: 'Instructor',
      roleId: instructorRole.id,
      statusId: 1,
      isActive: true,
      preferredLanguage: 'en',
    },
    // Add more users...
  ];

  await db.insert(users).values(usersData);

  console.log('✅ Users seeded successfully');
}
```

**2. Master Seeder**
```typescript
// src/database/seeders/index.ts
import { seedLookups } from './lookups.seeder';
import { seedUsers } from './users.seeder';
import { seedPlans } from './plans.seeder';
// Import all seeders...

async function runSeeders() {
  try {
    console.log('🌱 Starting database seeding...\n');

    await seedLookups();
    await seedUsers();
    await seedPlans();
    // Run all seeders in order...

    console.log('\n✅ All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeders();
```

---

## 🎨 Frontend Setup

### Next.js 15 Scaffold

**1. Setup Next.js App** (already exists at `apps/web`)

Update `apps/web/package.json`:
```json
{
  "name": "@leap-lms/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.62.8",
    "zustand": "^5.0.3",
    "react-hook-form": "^7.54.2",
    "@hookform/resolvers": "^3.9.1",
    "zod": "^3.24.1",
    "@apollo/client": "^3.12.3",
    "graphql": "^16.9.0",
    "socket.io-client": "^4.8.1",
    "next-auth": "^4.24.11",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.468.0",
    "next-intl": "^3.27.3"
  },
  "devDependencies": {
    "typescript": "^5.7.3",
    "@types/node": "^22.10.7",
    "@types/react": "^19.0.6",
    "@types/react-dom": "^19.0.2",
    "tailwindcss": "^3.4.18",
    "postcss": "^8.5.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.18.0",
    "eslint-config-next": "^15.1.6"
  }
}
```

**2. Install Shadcn UI**
```bash
cd apps/web
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input form card dialog table
npx shadcn-ui@latest add dropdown-menu select textarea badge avatar
```

**3. Create Providers**
```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApolloProvider } from '@apollo/client';
import { SessionProvider } from 'next-auth/react';
import { apolloClient } from '@/lib/apollo/client';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ApolloProvider client={apolloClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}
```

**4. Apollo Client Setup**
```typescript
// lib/apollo/client.ts
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
```

**5. Socket.io Client**
```typescript
// lib/socket/client.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
  autoConnect: false,
});

export const chatSocket = io(`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'}/chat`, {
  autoConnect: false,
});

export const notificationsSocket = io(`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'}/notifications`, {
  autoConnect: false,
});
```

---

## 🧪 Testing Setup

### Backend Testing

**1. Unit Test Example**
```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DATABASE_CONNECTION } from '../../database/database.module';

describe('UsersService', () => {
  let service: UsersService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([{ id: 1, email: 'test@test.com' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a user by id', async () => {
    const user = await service.findOne(1);
    expect(user).toBeDefined();
    expect(user.id).toBe(1);
  });
});
```

### Frontend Testing

**1. Component Test Example**
```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🔐 Keycloak Setup & Integration

### Initial Keycloak Configuration

**1. Access Keycloak Admin Console**

```bash
# Keycloak is available at:
https://keycloak.habib.cloud

# Default credentials:
Username: admin
Password: admin
```

**2. Create Realm**

1. Login to admin console
2. Hover over "Master" in top-left
3. Click "Create Realm"
4. Name: `leap-lms`
5. Click "Create"

**3. Create Client**

1. In `leap-lms` realm, go to "Clients"
2. Click "Create client"
3. Client ID: `leap-lms-backend`
4. Click "Next"
5. Enable "Client authentication"
6. Enable "Authorization"
7. Click "Save"
8. Go to "Credentials" tab
9. Copy the "Client secret"
10. Update `.env`:
```bash
KEYCLOAK_CLIENT_SECRET=<your-client-secret>
```

**4. Configure Admin Access**

The seeders use `admin-cli` client which is pre-configured. Just ensure admin credentials are in `.env`:

```bash
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

### Sync Users and Roles to Keycloak

**1. Seed Database First**

```bash
cd apps/backend
npm run seed
```

**2. Sync Roles and Permissions**

```bash
npm run seed:keycloak:roles
```

This creates:
- Realm roles for each user role (admin, instructor, user, recruiter)
- Permission-based roles for RBAC (e.g., `permission:course.create`)

**3. Sync Users**

```bash
npm run seed:keycloak:users
```

This syncs all database users to Keycloak with:
- User attributes (phone, avatar, locale, etc.)
- Role assignments
- Enabled status based on database flags

**4. Verify Sync**

1. Go to Keycloak Admin → Users
2. Check that all database users appear
3. Click on a user → "Role mappings" tab
4. Verify roles are assigned

### Automated Sync Configuration

Configure automatic synchronization in `.env`:

```bash
# Enable/disable sync
KEYCLOAK_SYNC_ENABLED=true

# Sync on user creation
KEYCLOAK_SYNC_ON_CREATE=true

# Sync on user updates
KEYCLOAK_SYNC_ON_UPDATE=true
```

When enabled:
- New users are automatically synced to Keycloak on registration
- User updates automatically sync to Keycloak
- Role changes automatically sync to Keycloak

### Manual Sync via API

Admins can manually trigger sync operations:

```bash
# Sync single user
curl -X POST http://localhost:3000/auth/admin/keycloak/sync/user/123 \
  -H "Authorization: Bearer <admin-token>"

# Sync all users
curl -X POST http://localhost:3000/auth/admin/keycloak/sync/users/all \
  -H "Authorization: Bearer <admin-token>"

# Sync roles
curl -X POST http://localhost:3000/auth/admin/keycloak/sync/roles \
  -H "Authorization: Bearer <admin-token>"
```

### Troubleshooting Keycloak

**Connection Issues**:
- Ensure Keycloak container is running: `docker-compose ps`
- Check Keycloak logs: `docker-compose logs keycloak`
- Verify `KEYCLOAK_URL` in `.env` is correct

**Sync Failures**:
- Check admin credentials are correct
- Ensure `admin-cli` client exists in realm
- Review application logs for specific errors
- Try manual sync via API endpoints

**Token Expiration**:
- Admin token refreshes automatically every 58 seconds
- Restart application if persistent issues

For detailed information, see [KEYCLOAK_SYNC.md](./KEYCLOAK_SYNC.md)

---

## 🚀 Next Steps

### Immediate Priorities

1. **Complete Core Modules** (in order):
   - Users Module (follow pattern above)
   - Subscriptions & Plans Modules
   - Notifications Module
   - Media Module

2. **Setup Additional API Layers**:
   - Configure GraphQL in AppModule
   - Add resolvers for Auth and Lookups
   - Setup WebSocket namespace for chat

3. **Create Basic Seeders**:
   - Lookup types and values (50+ types) ✅
   - Test users (admin, instructor, users) ✅
   - Sample plans and features ✅
   - Keycloak sync ✅

4. **Frontend Basics**:
   - Update Next.js configuration
   - Create authentication pages
   - Build dashboard layout

### Development Workflow

```bash
# Terminal 1: Start infrastructure
docker-compose -f docker/docker-compose.yml up -d

# Terminal 2: Start backend
cd apps/backend
npm run start:dev

# Terminal 3: Start frontend
cd apps/web
npm run dev

# Terminal 4: Run migrations and seeders
npm run db:push
npm run seed
```

---

## 📚 Additional Resources

- **NestJS Documentation**: https://docs.nestjs.com
- **Drizzle ORM**: https://orm.drizzle.team
- **Next.js**: https://nextjs.org/docs
- **Shadcn UI**: https://ui.shadcn.com
- **Apollo GraphQL**: https://www.apollographql.com/docs

---

**Note**: The patterns and templates provided here are production-ready and follow NestJS best practices. Apply these consistently across all remaining modules for a cohesive codebase.
