# Environment Setup Guide

This guide will help you set up all the necessary environment variables for the LEAP LMS platform.

## Prerequisites

Before starting, ensure you have accounts/access to:
- PostgreSQL database
- MinIO or AWS S3
- PayPal Developer Account
- Firebase Project

## Frontend Environment Variables

Create a `.env.local` file in `apps/web/` directory:

```bash
cp apps/web/.env.example apps/web/.env.local
```

### 1. API Configuration

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

- Update these URLs when deploying to production

### 2. NextAuth Configuration

```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<generate-random-secret>
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 3. PayPal Configuration

1. Go to https://developer.paypal.com/
2. Create a new app in Sandbox
3. Copy the Client ID

```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-sandbox-client-id
```

### 4. Firebase Configuration

1. Go to https://console.firebase.google.com/
2. Create a new project or use existing
3. Go to Project Settings > General
4. Scroll to "Your apps" and click Web icon
5. Register your app and copy the config

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

6. For Cloud Messaging:
   - Go to Project Settings > Cloud Messaging
   - Under Web Push certificates, generate a new key pair
   - Copy the key

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

7. Update `apps/web/public/firebase-messaging-sw.js` with your Firebase config

## Backend Environment Variables

Create a `.env` file in `apps/backend/` directory:

```bash
cp apps/backend/.env.example apps/backend/.env
```

### 1. Database Configuration

```env
DATABASE_URL=postgresql://username:password@localhost:5432/leap_lms
```

### 2. JWT Configuration

**Important**: JWT_SECRET must match NEXTAUTH_SECRET from frontend!

```env
JWT_SECRET=<same-as-nextauth-secret>
JWT_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d
```

### 3. MinIO Configuration

#### Option A: Local MinIO

1. Install MinIO:
```bash
# macOS
brew install minio

# Linux
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
```

2. Start MinIO:
```bash
minio server ./data --console-address ":9001"
```

3. Default credentials:
```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=leap-lms
MINIO_USE_SSL=false
MINIO_PUBLIC_URL=http://localhost:9000
```

#### Option B: AWS S3

If using AWS S3 instead of MinIO, configure AWS credentials and update the endpoint.

### 4. PayPal Configuration

Use the same Client ID from frontend plus the Secret:

```env
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
```

Get the secret from PayPal Developer Dashboard > Your App > Secret

### 5. Firebase Admin Configuration

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

**Note**: Keep the quotes around FIREBASE_PRIVATE_KEY and include the `\n` characters

## Starting the Services

### 1. Start MinIO (if using local)
```bash
minio server ./data --console-address ":9001"
```

### 2. Start PostgreSQL
```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

### 3. Start Backend
```bash
cd apps/backend
npm install
npm run start:dev
```

### 4. Start Frontend
```bash
cd apps/web
npm install
npm run dev
```

## Verification

### Test Backend
```bash
curl http://localhost:3000/api
```

### Test Frontend
Open http://localhost:3001 in your browser

### Test MinIO
Open http://localhost:9001 in your browser (MinIO Console)

### Test WebSocket
Check browser console for Socket.io connection logs

### Test FCM
1. Login to the app
2. Allow notification permissions
3. Check browser console for FCM token registration

## Production Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel Dashboard:
   - All `NEXT_PUBLIC_*` variables
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`

### Backend

1. Deploy to your hosting service (Heroku, Railway, etc.)
2. Add all environment variables
3. Update `NEXT_PUBLIC_API_URL` in frontend to point to production backend

### Database

1. Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
2. Update `DATABASE_URL`

### File Storage

1. Use production MinIO or AWS S3
2. Update MinIO environment variables
3. Set `MINIO_USE_SSL=true` for production

## Security Checklist

- [ ] All secrets are generated randomly and securely
- [ ] JWT_SECRET matches NEXTAUTH_SECRET
- [ ] Database credentials are strong
- [ ] MinIO/S3 buckets have proper access policies
- [ ] Firebase private key is kept secure
- [ ] PayPal is in sandbox mode for development
- [ ] All production URLs use HTTPS
- [ ] Environment variables are never committed to Git

## Troubleshooting

### Can't connect to backend
- Check if backend is running on correct port
- Verify NEXT_PUBLIC_API_URL is correct
- Check for CORS issues

### Socket.io not connecting
- Verify NEXT_PUBLIC_WS_URL is correct
- Check if backend WebSocket server is running
- Look for errors in browser console

### File uploads failing
- Check MinIO is running
- Verify MinIO credentials
- Check bucket exists and is accessible

### Notifications not working
- Verify Firebase credentials are correct
- Check browser console for FCM errors
- Ensure notification permissions are granted
- Verify service worker is registered

### PayPal errors
- Ensure you're using Sandbox mode for development
- Verify Client ID and Secret are correct
- Check PayPal Developer Dashboard for errors

## Support

For more information, see:
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MinIO Documentation](https://docs.min.io/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [PayPal Documentation](https://developer.paypal.com/docs/)
