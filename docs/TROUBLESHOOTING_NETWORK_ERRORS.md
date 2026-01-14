# Troubleshooting Network Errors

## Common Network Error: "Failed to fetch chat rooms"

### Error Message
```
AxiosError {message: 'Network Error', name: 'AxiosError', code: 'ERR_NETWORK'}
```

### Possible Causes

#### 1. Backend Server Not Running
**Symptom**: Network error with no response from server

**Solution**:
```bash
# Check if backend is running
cd apps/backend
npm run start:dev

# Or check if it's running on the expected port
curl http://localhost:3000/api/v1/health
```

#### 2. Incorrect API URL Configuration
**Symptom**: Requests going to wrong URL

**Solution**:
- Check `.env.local` or `.env` file in `apps/web/`
- Verify `NEXT_PUBLIC_API_URL` is set correctly:
  ```bash
  NEXT_PUBLIC_API_URL=http://localhost:3000
  ```
- Restart the frontend after changing environment variables

#### 3. CORS Configuration Issue
**Symptom**: Network error in browser console, CORS errors visible

**Solution**:
- Check backend CORS configuration in `apps/backend/src/main.ts`
- Ensure frontend origin is whitelisted:
  ```typescript
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });
  ```

#### 4. Authentication Token Not Being Sent
**Symptom**: 401 errors or network errors when token is missing

**Solution**:
- Check if user is logged in
- Verify NextAuth session is active
- Check browser console for session errors
- Ensure `accessToken` is in the session

#### 5. Firewall or Network Issues
**Symptom**: Timeout errors or connection refused

**Solution**:
- Check firewall settings
- Verify network connectivity
- Test with `curl` or Postman

### Debugging Steps

#### Step 1: Check Backend Health
```bash
# In browser console or terminal
curl http://localhost:3000/api/v1/health
```

#### Step 2: Verify API URL
```typescript
// In browser console
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

#### Step 3: Check Network Tab
1. Open browser DevTools
2. Go to Network tab
3. Try to fetch chat rooms
4. Check the failed request:
   - Status code
   - Request URL
   - Response headers
   - CORS errors

#### Step 4: Verify Authentication
```typescript
// In browser console
import { getSession } from 'next-auth/react';
const session = await getSession();
console.log('Session:', session);
console.log('Access Token:', session?.accessToken);
```

#### Step 5: Test API Directly
```bash
# Test with curl (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/chat/rooms
```

### Enhanced Error Messages

The updated code now provides detailed error messages:

1. **Network Errors**: Shows attempted URL and troubleshooting steps
2. **Authentication Errors**: Indicates token issues
3. **CORS Errors**: Points to CORS configuration
4. **Timeout Errors**: Suggests backend might be down

### Quick Fixes

#### Fix 1: Restart Both Servers
```bash
# Terminal 1 - Backend
cd apps/backend
npm run start:dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

#### Fix 2: Clear Browser Cache
- Clear browser cache and cookies
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Try incognito/private mode

#### Fix 3: Check Environment Variables
```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000

# Backend .env
PORT=3000
FRONTEND_URL=http://localhost:3001
```

#### Fix 4: Verify CORS Settings
In `apps/backend/src/main.ts`:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Prevention

1. **Always check backend is running** before testing frontend
2. **Use environment variables** for API URLs
3. **Test API endpoints** with Postman/curl first
4. **Monitor browser console** for detailed errors
5. **Check network tab** for request/response details

### Getting Help

If the issue persists:

1. Check browser console for full error details
2. Check backend logs for incoming requests
3. Verify all environment variables are set
4. Test API endpoint directly with curl/Postman
5. Check CORS configuration matches frontend URL
