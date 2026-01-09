#!/bin/bash

# Environment Setup Script
# This script creates the necessary .env files with default values

echo "🚀 Setting up environment files..."

# Backend .env
echo "📦 Creating backend .env file..."
cat > apps/backend/.env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://postgres:@localhost:5432/leap_lms

# JWT Configuration
JWT_SECRET=change-this-in-production-to-a-random-string
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Keycloak Configuration
KEYCLOAK_AUTH_SERVER_URL=https://keycloak.habib.cloud
KEYCLOAK_REALM=leap-realm
KEYCLOAK_CLIENT_ID=leap-client
KEYCLOAK_CLIENT_SECRET=your-keycloak-backend-secret-here

# Application URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Session Configuration
MAX_CONCURRENT_SESSIONS=5
SESSION_MAX_AGE=604800
SESSION_MAX_AGE_REMEMBER_ME=2592000

# 2FA Configuration
TOTP_ISSUER=LEAP PM
TOTP_WINDOW=1

# Server Configuration
PORT=3000
NODE_ENV=development

# gRPC Configuration
GRPC_URL=0.0.0.0:5000

# Email Configuration (optional)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@leap-lms.com
EOF

echo "✅ Backend .env created"

# Frontend .env.local
echo "🌐 Creating frontend .env.local file..."
cat > apps/web/.env.local << 'EOF'
# Backend API URL - REQUIRED!
NEXT_PUBLIC_API_URL=http://localhost:3000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=change-this-in-production-to-a-random-string

# Session Configuration
SESSION_MAX_AGE=604800

# Keycloak Configuration (for NextAuth provider)
KEYCLOAK_CLIENT_ID_WEB=leap-client
KEYCLOAK_CLIENT_SECRET_WEB=rxB1oiOlkEw1v6MWNBWvPvqJfoBot8Yj-here
KEYCLOAK_ISSUER=https://keycloak.habib.cloud/realms/leap-realm

# OAuth Providers (optional)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# FACEBOOK_CLIENT_ID=
# FACEBOOK_CLIENT_SECRET=
EOF

echo "✅ Frontend .env.local created"

# Copy proto files
echo "📄 Copying proto files to dist..."
cd apps/backend
mkdir -p dist/grpc/proto
cp src/grpc/proto/*.proto dist/grpc/proto/ 2>/dev/null || echo "⚠️  Proto files not copied (dist folder may not exist yet - will be created on build)"
cd ../..

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update secrets in .env files (JWT_SECRET, KEYCLOAK_CLIENT_SECRET, etc.)"
echo "2. Ensure Keycloak is running: cd docker && docker-compose up -d keycloak"
echo "3. Build backend: cd apps/backend && bun run build"
echo "4. Start development: bun run dev (from project root)"
echo ""
echo "📚 For more information, see:"
echo "   - QUICK_FIX_GUIDE.md (troubleshooting)"
echo "   - ENVIRONMENT_SETUP.md (detailed setup)"
echo "   - KEYCLOAK_LOGIN_QUICKSTART.md (Keycloak configuration)"
echo ""
