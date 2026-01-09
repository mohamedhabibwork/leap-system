# Integration Testing Guide

This guide provides step-by-step instructions for testing all integrated features of the LEAP LMS platform.

## Prerequisites

- Both frontend and backend servers running
- Environment variables configured
- Database migrations run
- MinIO server running
- Firebase project configured

## 1. Authentication Flow Testing

### 1.1 User Registration
1. Navigate to `/register`
2. Fill in the registration form
3. Submit the form
4. **Expected**: User account created, redirect to login

### 1.2 User Login
1. Navigate to `/login`
2. Enter valid credentials
3. Click "Login"
4. **Expected**: JWT token stored, redirect to dashboard

### 1.3 Route Guards
1. While logged out, try accessing `/hub`
2. **Expected**: Redirect to login page
3. Login as regular user, try accessing `/admin`
4. **Expected**: Redirect to `/hub` (unauthorized)
5. Login as admin, access `/admin`
6. **Expected**: Admin dashboard loads successfully

### 1.4 Session Management
1. Login and note the session
2. Close browser and reopen
3. **Expected**: Still logged in (if session persists)
4. Click logout
5. **Expected**: Redirect to login, session cleared

**Test Commands:**
```bash
# Check if JWT token is being sent
# Open browser DevTools > Network > Check request headers
# Should see: Authorization: Bearer <token>
```

## 2. API Integration Testing

### 2.1 Courses API
```bash
# List courses
curl -X GET http://localhost:3000/lms/courses?page=1&limit=10

# Get course by ID
curl -X GET http://localhost:3000/lms/courses/1

# Create course (requires auth token)
curl -X POST http://localhost:3000/lms/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "description": "Test Description",
    "price": 99.99
  }'
```

### 2.2 Posts API (Social)
```bash
# List posts with pagination
curl -X GET "http://localhost:3000/social/posts?page=1&limit=10"

# Create post (requires auth)
curl -X POST http://localhost:3000/social/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test post content",
    "visibility": "public"
  }'

# Like a post
curl -X POST http://localhost:3000/social/posts/1/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2.3 Frontend Integration
1. Login to the app
2. Navigate to `/hub/courses`
3. **Expected**: List of courses displayed
4. Navigate to `/hub/social`
5. **Expected**: Social feed with posts
6. Create a new post
7. **Expected**: Post appears immediately (optimistic update)

## 3. File Upload Testing

### 3.1 MinIO Connection
```bash
# Check MinIO is running
curl http://localhost:9000/minio/health/live

# Expected: OK
```

### 3.2 Post Image Upload
1. Login and go to social feed
2. Click "Create Post"
3. Click image icon to upload
4. Select an image file (JPG, PNG)
5. **Expected**: Image preview shown
6. Submit the post
7. **Expected**: 
   - "Uploading images..." toast
   - Image uploaded to MinIO
   - Post created with image URL
   - Post displays with image

### 3.3 Course Thumbnail Upload
1. Login as instructor
2. Go to "Create Course"
3. Upload a thumbnail image
4. **Expected**: Image uploaded and preview shown

### 3.4 Profile Avatar Upload
1. Go to profile settings
2. Upload new avatar
3. **Expected**: Avatar updated across the app

### 3.5 Verify in MinIO
1. Open http://localhost:9001
2. Login with MinIO credentials
3. Navigate to `leap-lms` bucket
4. **Expected**: Uploaded files visible in folders (posts/, courses/, etc.)

## 4. Real-Time Features (Socket.io)

### 4.1 Chat Testing

**Setup**: Open two browser windows side by side

#### Window 1:
1. Login as User A
2. Go to `/hub/chat`
3. Select a chat room or create one

#### Window 2:
1. Login as User B (different account)
2. Go to `/hub/chat`
3. Join the same chat room

#### Test Messages:
1. In Window 1, type a message and send
2. **Expected**: Message appears in Window 2 immediately
3. In Window 2, reply
4. **Expected**: Reply appears in Window 1 immediately

#### Test Typing Indicator:
1. In Window 1, start typing (don't send)
2. **Expected**: "User is typing..." appears in Window 2
3. Stop typing or send message
4. **Expected**: Typing indicator disappears

### 4.2 Notifications Testing

1. Login and check browser console
2. **Expected**: See "Notifications client connected" log
3. Trigger a notification event (e.g., someone comments on your post)
4. **Expected**: Real-time notification appears
5. Check notification bell icon
6. **Expected**: Unread count updates immediately

### 4.3 WebSocket Connection Test
```javascript
// Open browser console and check:
console.log('Socket connected:', socket.connected);

// Should log network requests for websocket
// Look for: ws://localhost:3000/chat
// Status: 101 Switching Protocols
```

## 5. Payment Integration (PayPal)

### 5.1 Course Purchase

1. Login to the app
2. Browse courses at `/hub/courses`
3. Click on a paid course
4. Click "Enroll" button
5. **Expected**: PayPal button appears
6. Click PayPal button
7. **Expected**: PayPal popup opens
8. Login with PayPal Sandbox test account:
   - Email: sb-buyer@personal.example.com
   - Password: (from PayPal Sandbox)
9. Complete the payment
10. **Expected**:
    - "Payment successful" toast
    - User enrolled in course
    - Access to course content granted
    - Payment record created in database

### 5.2 Test PayPal Sandbox Accounts

Create test accounts at https://developer.paypal.com/developer/accounts/

**Buyer Account:**
- Create "Personal" account
- Fund with test money
- Use for purchases

**Seller Account:**
- Create "Business" account
- Use for receiving payments

### 5.3 Verify Payment

1. Check PayPal Sandbox Dashboard
2. **Expected**: Transaction visible
3. Check database payments table
4. **Expected**: Payment record exists
5. Check enrollments table
6. **Expected**: Enrollment record exists

## 6. Push Notifications (FCM)

### 6.1 Permission Request
1. Login for the first time
2. **Expected**: Browser asks for notification permission
3. Click "Allow"
4. **Expected**: 
   - "FCM token registered successfully" in console
   - Token sent to backend

### 6.2 Test Notification

```bash
# Get your FCM token from browser console
# Then test with:
curl -X POST http://localhost:3000/notifications/send-test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_FCM_TOKEN"
  }'
```

**Expected**: Notification appears on your device/browser

### 6.3 Background Notifications
1. Minimize or switch away from the app
2. Trigger a notification (via test endpoint or app action)
3. **Expected**: System notification appears

### 6.4 Notification Click
1. Click on a notification
2. **Expected**: App opens and navigates to relevant page

## 7. Error Handling Testing

### 7.1 Network Errors
1. Disconnect from internet
2. Try to load courses
3. **Expected**: Error message displayed
4. Reconnect
5. **Expected**: Data loads automatically

### 7.2 Invalid Data
```bash
# Test invalid course creation
curl -X POST http://localhost:3000/lms/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "price": -10
  }'

# Expected: 400 Bad Request with validation errors
```

### 7.3 Authentication Errors
```bash
# Test with invalid token
curl -X GET http://localhost:3000/lms/enrollments/my-enrollments \
  -H "Authorization: Bearer invalid_token"

# Expected: 401 Unauthorized
```

### 7.4 Permission Errors
1. Login as regular user
2. Try to access admin endpoint
3. **Expected**: 403 Forbidden

## 8. Performance Testing

### 8.1 Pagination
1. Go to courses page
2. Scroll to bottom
3. **Expected**: Next page loads automatically (infinite scroll)
4. Check network tab
5. **Expected**: Only new data fetched, not entire dataset

### 8.2 Caching
1. Visit a course page
2. Navigate away
3. Return to the same course
4. **Expected**: Loads from cache (faster, no loading spinner)

### 8.3 Optimistic Updates
1. Create a post
2. **Expected**: Post appears immediately (before server confirms)
3. If network error occurs
4. **Expected**: Post removed and error shown

## 9. Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## 10. Mobile Responsiveness

Test on different screen sizes:
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1280px+)

**Test Areas:**
- Navigation menu (hamburger on mobile)
- Forms (touch-friendly inputs)
- Chat interface (stacks vertically on mobile)
- Cards layout (responsive grid)

## Common Issues & Solutions

### Socket.io not connecting
- Check NEXT_PUBLIC_WS_URL is correct
- Verify backend WebSocket server is running
- Check browser console for CORS errors

### File uploads failing
- Verify MinIO is running: `curl http://localhost:9000/minio/health/live`
- Check MinIO credentials in .env
- Verify bucket exists

### PayPal not working
- Ensure using Sandbox mode
- Check Client ID is correct
- Verify account has test funds

### Notifications not appearing
- Check browser notification permissions
- Verify Firebase credentials
- Check service worker is registered: DevTools > Application > Service Workers

### JWT token expired
- Token expires after configured time (default 7 days)
- Login again to get new token
- Check JWT_EXPIRATION in backend .env

## Test Checklist

### Authentication ✓
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Route guards work
- [ ] Role-based access works

### API Integration ✓
- [ ] Can fetch courses
- [ ] Can create posts
- [ ] Pagination works
- [ ] Error handling works
- [ ] Optimistic updates work

### File Uploads ✓
- [ ] Post images upload
- [ ] Course thumbnails upload
- [ ] Profile avatars upload
- [ ] Files visible in MinIO

### Real-Time ✓
- [ ] Chat messages appear instantly
- [ ] Typing indicators work
- [ ] Notifications appear in real-time
- [ ] Reconnection works after disconnect

### Payments ✓
- [ ] PayPal button renders
- [ ] Can complete payment in sandbox
- [ ] Enrollment granted after payment
- [ ] Payment recorded in database

### Push Notifications ✓
- [ ] Permission requested
- [ ] Token registered
- [ ] Test notification received
- [ ] Background notifications work
- [ ] Click handler works

## Next Steps

After successful testing:
1. Fix any issues found
2. Deploy to staging environment
3. Run tests again on staging
4. Deploy to production
5. Monitor for errors using error tracking tool (Sentry)

## Support & Resources

- Backend API: http://localhost:3000/api
- Frontend: http://localhost:3001
- MinIO Console: http://localhost:9001
- Swagger API Docs: http://localhost:3000/api/docs (if enabled)
