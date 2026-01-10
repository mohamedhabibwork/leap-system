# Quick Start Guide - Post-Refactor

## 🚀 Getting Started

Your LMS platform has been significantly enhanced with security, monitoring, i18n, and theme support. Here's how to get started.

---

## 📋 Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker & Docker Compose
- PostgreSQL client (optional)

---

## 🔧 Installation

### 1. Clone and Install Dependencies

```bash
cd /Users/habib/.cursor/worktrees/leapv2-system/eqg
npm install
```

### 2. Setup Environment

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/leap_lms

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=1d

# Keycloak
KEYCLOAK_URL=https://keycloak.habib.cloud
KEYCLOAK_REALM=leap-realm
KEYCLOAK_CLIENT_ID=leap-client
KEYCLOAK_CLIENT_SECRET=your-secret

# Storage
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### 3. Start Infrastructure

```bash
cd docker
docker-compose up -d
```

**Services Started**:
- PostgreSQL (5432)
- Redis (6379)
- RabbitMQ (5672, 15672)
- Kafka (9092)
- MinIO (9000, 9001)
- Keycloak (8080)
- **Prometheus (9090)** ✨ NEW
- **Grafana (3002)** ✨ NEW

### 4. Run Database Migrations

```bash
npm run db:generate
npm run db:push
npm run seed
```

### 5. Start Development Servers

```bash
npm run dev
```

**Services**:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`
- Swagger API: `http://localhost:3000/api/docs`
- GraphQL: `http://localhost:3000/graphql`
- **Prometheus**: `http://localhost:9090` ✨ NEW
- **Grafana**: `http://localhost:3002` ✨ NEW

---

## 🔐 Security Features (NEW)

### Role Hierarchy
Your system now has a complete role hierarchy:

```
SUPER_ADMIN (Level 4) → Full access to everything
    ↓
ADMIN (Level 3) → Platform management
    ↓
INSTRUCTOR (Level 2) → Own courses & students
RECRUITER (Level 2) → Job postings
    ↓
STUDENT (Level 1) → Own enrollments & submissions
```

### Testing Security

```bash
# Test as different roles
# 1. Login as super admin - should access everything
# 2. Login as student - should only see own data
# 3. Try accessing another student's data - should fail
# 4. Login as instructor - should see own courses only
```

### Default Users (from seeder):
- Super Admin: `superadmin@example.com`
- Admin: `admin@example.com`
- Instructor: `instructor1@example.com`
- Student: `student1@example.com`
- Default password: Check seeder file

---

## 📊 Monitoring (NEW)

### Prometheus
**URL**: `http://localhost:9090`

**Available Metrics**:
- `lms_http_requests_total` - HTTP request count
- `lms_http_request_duration_seconds` - Request latency
- `lms_active_users` - Active users by role
- `lms_enrollments_total` - Total enrollments
- `lms_websocket_connections_active` - Active WS connections
- `lms_payments_total` - Payment count
- `lms_db_query_duration_seconds` - Database performance
- `lms_login_attempts_total` - Login attempts
- `lms_login_failures_total` - Failed logins

### Grafana
**URL**: `http://localhost:3002`  
**Default Login**: admin / admin

**Dashboards Available**:
- LMS Platform Overview

**To Create More Dashboards**:
1. Go to Grafana
2. Create → Dashboard
3. Add panels with Prometheus queries
4. Save to `/docker/grafana/dashboards/`

---

## 🌍 Multi-Language (NEW)

### Switching Language

Your frontend now supports English and Arabic!

**Current Setup**:
- English: `http://localhost:3001/en`
- Arabic: `http://localhost:3001/ar`

**In Components**:
```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  
  return (
    <button>{t('actions.save')}</button>
  );
}
```

**Translation Files**:
- English: `apps/web/locales/en/common.json`
- Arabic: `apps/web/locales/ar/common.json`

**To Add More Translations**:
1. Add key to both `en/common.json` and `ar/common.json`
2. Use in component: `t('your.new.key')`
3. Test in both languages

---

## 🎨 Theme Switching (NEW)

### Using Theme Toggle

Import the component:
```typescript
import { ThemeToggle } from '@/components/theme-toggle';

// In your navigation
<ThemeToggle />
```

**Themes Available**:
- Light
- Dark
- System (auto-detects OS preference)

**Theme persists** across sessions automatically.

---

## 📤 File Uploads (ENHANCED)

### Using Upload Components

**Avatar Upload**:
```typescript
import { AvatarUpload } from '@/components/upload/avatar-upload';

<AvatarUpload
  currentAvatar={user.avatar}
  onUpload={async (file) => {
    const response = await uploadAvatar(file);
    return response.url;
  }}
  name={user.name}
/>
```

**Generic File Upload**:
```typescript
import { FileUpload } from '@/components/upload/file-upload';

<FileUpload
  onUpload={async (file) => {
    await uploadFile(file);
  }}
  accept={{ 'application/pdf': ['.pdf'] }}
  maxSize={10 * 1024 * 1024}
/>
```

**API Endpoints**:
- `POST /api/v1/media/upload` - General file upload
- `POST /api/v1/media/upload/avatar` - Avatar upload (secured)

---

## 🧪 Testing

### Manual Testing

**Security Tests**:
```bash
# 1. Test without auth
curl http://localhost:3000/api/v1/users

# 2. Test with wrong role
curl -H "Authorization: Bearer <student_token>" \
  http://localhost:3000/api/v1/admin/users

# 3. Test accessing others' data
curl -H "Authorization: Bearer <user1_token>" \
  http://localhost:3000/api/v1/enrollments/user2-enrollment-id
```

**i18n Testing**:
- Visit `/en` and `/ar`
- Check RTL layout in Arabic
- Verify translations

**Theme Testing**:
- Toggle between light/dark
- Check all pages
- Verify persistence

---

## 📚 Important Documents

**For Developers**:
- `SECURITY_IMPLEMENTATION_README.md` - How to secure controllers
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `SECURITY_AUDIT_CHECKLIST.md` - What needs to be secured

**For Project Managers**:
- `REFACTOR_COMPLETION_SUMMARY.md` - What's done & what's left
- `BACKEND_API_AUDIT.md` - API status
- `PHASE_0_COMPLETION_REPORT.md` - Security implementation report

**For QA**:
- `SECURITY_AUDIT_CHECKLIST.md` - Testing checklist
- Test with all 5 role types
- Verify ownership restrictions

---

## 🎯 Common Tasks

### Add a New Secured Controller

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResourceOwnerGuard } from '../../common/guards/resource-owner.guard';
import { Role } from '../../common/enums/roles.enum';

@Controller('resource')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
export class ResourceController {
  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ResourceType('resource')
  update() { }
}
```

### Add a New Translation

1. Edit `apps/web/locales/en/common.json`:
```json
{
  "myFeature": {
    "title": "My Feature"
  }
}
```

2. Edit `apps/web/locales/ar/common.json`:
```json
{
  "myFeature": {
    "title": "ميزتي"
  }
}
```

3. Use in component:
```typescript
const t = useTranslations('myFeature');
<h1>{t('title')}</h1>
```

### Add Custom Metrics

```typescript
import { MetricsService } from '@/monitoring/metrics.service';

constructor(private metricsService: MetricsService) {}

// Record an event
this.metricsService.recordEnrollment(courseId, 'purchase');
this.metricsService.recordPayment('paypal', 'completed', 99.99);
```

---

## ⚡ Performance Tips

1. **Enable Redis Caching** (already in infrastructure)
2. **Use React Query** (already configured)
3. **Lazy Load Components** (Next.js dynamic imports)
4. **Monitor with Grafana** (check slow endpoints)
5. **Use DataLoader** (for GraphQL N+1 prevention)

---

## 🆘 Troubleshooting

### Backend Won't Start
- Check if PostgreSQL is running: `docker ps`
- Verify .env file exists
- Check logs: `docker-compose logs backend`

### Frontend Build Errors
- Clear Next.js cache: `rm -rf apps/web/.next`
- Reinstall: `npm run clean && npm install`

### Monitoring Not Working
- Verify Prometheus config: `docker/prometheus.yml`
- Check Prometheus targets: `http://localhost:9090/targets`
- Verify backend exposes `/metrics`

### i18n Not Working
- Check middleware is configured
- Verify translation files exist
- Check browser URL includes locale: `/en/` or `/ar/`

### Theme Not Switching
- Clear browser cache
- Check ThemeProvider in providers.tsx
- Verify `suppressHydrationWarning` in layout

---

## 📞 Support

- Security Questions: Read `SECURITY_IMPLEMENTATION_README.md`
- API Questions: Check Swagger at `/api/docs`
- Monitoring: Check Grafana at `:3002`
- Code Examples: Study secured controllers

---

**Status**: ✅ System Ready for Development  
**Security**: 🟢 Foundation Complete (rollout 8.5%)  
**Features**: 🟡 70% Complete  
**Production Ready**: ⏳ 3-4 weeks (after security audit)

