# Verification Checklist: Queues, PDFs, Notifications, and Frontend-Backend Communication

## Prerequisites

1. **Environment Setup**
   - [ ] RabbitMQ is running (check `docker-compose.yml` or local installation)
   - [ ] Backend server is running on port 3000
   - [ ] Frontend server is running on port 3001
   - [ ] Database is accessible
   - [ ] Environment variables are set correctly (see `env.example`)

2. **Required Environment Variables**
   ```bash
   RABBITMQ_URL=amqp://guest:guest@localhost:5672
   RABBITMQ_HOST=localhost
   RABBITMQ_PORT=5672
   RABBITMQ_USER=guest
   RABBITMQ_PASSWORD=guest
   GRPC_HOST=0.0.0.0
   GRPC_PORT=5000
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_GRPC_WEB_URL=http://localhost:8081
   ```

## Queue Verification

### RabbitMQ Connection
- [ ] Backend logs show "✅ RabbitMQ connected successfully"
- [ ] Backend logs show "✅ RabbitMQ queues asserted"
- [ ] Backend logs show "✅ Queue consumers registered"
- [ ] Check RabbitMQ Management UI at `http://localhost:15672` (guest/guest)
  - [ ] `invoice-queue` exists
  - [ ] `certificate-queue` exists
  - [ ] `email-queue` exists
  - [ ] `notification-queue` exists

### Queue Processing
- [ ] Create a test payment and verify invoice generation is queued
- [ ] Check backend logs for "Processing invoice generation for payment {id}"
- [ ] Verify invoice PDF is generated in `storage/invoices/` directory
- [ ] Complete a course enrollment (set completionPercentage to 100)
- [ ] Check backend logs for "Processing certificate generation for enrollment {id}"
- [ ] Verify certificate PDF is generated in `storage/certificates/` directory

## PDF Generation Verification

### Invoice PDFs
- [ ] Create a payment via API: `POST /api/v1/payments`
- [ ] Check that invoice PDF is generated automatically via queue
- [ ] Download invoice: `GET /api/v1/payments/{id}/invoice/download`
  - [ ] PDF file is returned with correct Content-Type
  - [ ] PDF contains correct invoice number
  - [ ] PDF contains payment details (amount, currency, transaction ID)
  - [ ] PDF contains user information

### Certificate PDFs
- [ ] Complete a course enrollment (update enrollment with completionPercentage: 100)
- [ ] Check that certificate PDF is generated automatically via queue
- [ ] Generate certificate manually: `GET /api/v1/lms/certificates/{enrollmentId}/generate`
- [ ] Download certificate: `GET /api/v1/lms/certificates/{enrollmentId}/download`
  - [ ] PDF file is returned with correct Content-Type
  - [ ] PDF contains student name
  - [ ] PDF contains course name
  - [ ] PDF contains completion date
  - [ ] PDF contains certificate number

## Notifications Verification

### Payment Notifications
- [ ] Create a payment and verify notification is sent
- [ ] Check database for notification record
- [ ] Verify WebSocket notification is received (if WebSocket is connected)
- [ ] Check email notification (if email service is configured)
- [ ] Notification should contain invoice download link

### Certificate Notifications
- [ ] Complete a course and verify notification is sent
- [ ] Check database for notification record
- [ ] Verify WebSocket notification is received
- [ ] Check email notification
- [ ] Notification should contain certificate download link

## Frontend-Backend Communication

### API Endpoints
- [ ] Frontend can fetch payments: `GET /api/v1/payments/my-payments`
- [ ] Frontend can fetch payment details: `GET /api/v1/payments/{id}`
- [ ] Frontend can get invoice info: `GET /api/v1/payments/{id}/invoice`
- [ ] Frontend can download invoice PDF: `GET /api/v1/payments/{id}/invoice/download`
- [ ] Frontend can generate certificate: `GET /api/v1/lms/certificates/{enrollmentId}/generate`
- [ ] Frontend can download certificate: `GET /api/v1/lms/certificates/{enrollmentId}/download`

### gRPC Communication
- [ ] Frontend gRPC client is configured with correct URL
- [ ] gRPC calls are working (test with existing endpoints)
- [ ] Check Envoy proxy is running if using gRPC-Web

### Frontend API Integration
- [ ] `paymentsAPI.getMyPayments()` works
- [ ] `paymentsAPI.downloadInvoiceFile()` triggers browser download
- [ ] `certificatesAPI.generateCertificate()` works
- [ ] `certificatesAPI.downloadCertificateFile()` triggers browser download

## End-to-End Tests

### Payment Flow
1. [ ] User makes a payment
2. [ ] Payment is created in database
3. [ ] Invoice generation is queued
4. [ ] Invoice PDF is generated
5. [ ] Notification is sent to user
6. [ ] User can download invoice from frontend

### Certificate Flow
1. [ ] User completes a course (completionPercentage = 100)
2. [ ] Enrollment is updated
3. [ ] Certificate generation is queued
4. [ ] Certificate PDF is generated
5. [ ] Notification is sent to user
6. [ ] User can download certificate from frontend

## Error Handling

- [ ] RabbitMQ connection failure is handled gracefully
- [ ] PDF generation errors are logged
- [ ] Missing payment/enrollment returns 404
- [ ] Unauthorized access returns 401/403
- [ ] Frontend handles API errors gracefully

## Performance

- [ ] Invoice generation completes within 5 seconds
- [ ] Certificate generation completes within 5 seconds
- [ ] Queue processing doesn't block main application
- [ ] PDF downloads are fast (< 2 seconds for typical files)

## Storage

- [ ] Invoice PDFs are stored in `storage/invoices/`
- [ ] Certificate PDFs are stored in `storage/certificates/`
- [ ] Storage directories are created automatically
- [ ] Files are accessible via API endpoints

## Manual Testing Commands

```bash
# Test RabbitMQ connection
curl -u guest:guest http://localhost:15672/api/overview

# Test payment creation (requires auth token)
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 100, "currency": "USD", "paymentMethod": "paypal", "status": "completed"}'

# Test invoice download (requires auth token)
curl -X GET http://localhost:3000/api/v1/payments/1/invoice/download \
  -H "Authorization: Bearer {token}" \
  -o invoice.pdf

# Test certificate generation (requires auth token)
curl -X GET http://localhost:3000/api/v1/lms/certificates/1/generate \
  -H "Authorization: Bearer {token}"

# Test certificate download (requires auth token)
curl -X GET http://localhost:3000/api/v1/lms/certificates/1/download \
  -H "Authorization: Bearer {token}" \
  -o certificate.pdf
```

## Notes

- If RabbitMQ is not available, the service will log warnings but continue operating
- PDFs are generated on-demand when first requested
- Notifications are sent asynchronously via queue
- Frontend API calls require authentication tokens
