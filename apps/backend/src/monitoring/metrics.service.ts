import { Injectable } from '@nestjs/common';
import { 
  Counter, 
  Gauge, 
  Histogram, 
  Summary 
} from 'prom-client';
import { makeCounterProvider, makeGaugeProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

/**
 * Metrics Service
 * Provides custom application metrics for Prometheus
 */
@Injectable()
export class MetricsService {
  // HTTP Metrics
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  
  // Application Metrics
  private readonly activeUsersGauge: Gauge<string>;
  private readonly enrollmentsTotal: Counter<string>;
  private readonly coursesTotal: Gauge<string>;
  private readonly paymentsTotal: Counter<string>;
  private readonly paymentAmount: Histogram<string>;
  
  // WebSocket Metrics
  private readonly wsConnectionsActive: Gauge<string>;
  private readonly wsMessagesTotal: Counter<string>;
  
  // Database Metrics
  private readonly dbQueryDuration: Histogram<string>;
  private readonly dbConnectionsActive: Gauge<string>;
  
  // File Upload Metrics
  private readonly fileUploadsTotal: Counter<string>;
  private readonly fileUploadSize: Histogram<string>;
  
  // Authentication Metrics
  private readonly loginAttempts: Counter<string>;
  private readonly loginFailures: Counter<string>;

  constructor() {
    // Initialize HTTP metrics
    this.httpRequestsTotal = new Counter({
      name: 'lms_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'lms_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    });

    // Initialize application metrics
    this.activeUsersGauge = new Gauge({
      name: 'lms_active_users',
      help: 'Number of active users in the platform',
      labelNames: ['role'],
    });

    this.enrollmentsTotal = new Counter({
      name: 'lms_enrollments_total',
      help: 'Total number of course enrollments',
      labelNames: ['course_id', 'enrollment_type'],
    });

    this.coursesTotal = new Gauge({
      name: 'lms_courses_total',
      help: 'Total number of courses',
      labelNames: ['status', 'category'],
    });

    this.paymentsTotal = new Counter({
      name: 'lms_payments_total',
      help: 'Total number of payments processed',
      labelNames: ['payment_method', 'status'],
    });

    this.paymentAmount = new Histogram({
      name: 'lms_payment_amount_dollars',
      help: 'Payment amounts in dollars',
      labelNames: ['payment_method'],
      buckets: [10, 25, 50, 100, 250, 500, 1000],
    });

    // Initialize WebSocket metrics
    this.wsConnectionsActive = new Gauge({
      name: 'lms_websocket_connections_active',
      help: 'Number of active WebSocket connections',
      labelNames: ['namespace'],
    });

    this.wsMessagesTotal = new Counter({
      name: 'lms_websocket_messages_total',
      help: 'Total number of WebSocket messages',
      labelNames: ['namespace', 'event'],
    });

    // Initialize database metrics
    this.dbQueryDuration = new Histogram({
      name: 'lms_db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    });

    this.dbConnectionsActive = new Gauge({
      name: 'lms_db_connections_active',
      help: 'Number of active database connections',
    });

    // Initialize file upload metrics
    this.fileUploadsTotal = new Counter({
      name: 'lms_file_uploads_total',
      help: 'Total number of file uploads',
      labelNames: ['file_type', 'storage_provider'],
    });

    this.fileUploadSize = new Histogram({
      name: 'lms_file_upload_size_bytes',
      help: 'File upload sizes in bytes',
      labelNames: ['file_type'],
      buckets: [1024, 10240, 102400, 1048576, 10485760, 104857600], // 1KB to 100MB
    });

    // Initialize authentication metrics
    this.loginAttempts = new Counter({
      name: 'lms_login_attempts_total',
      help: 'Total number of login attempts',
      labelNames: ['method'],
    });

    this.loginFailures = new Counter({
      name: 'lms_login_failures_total',
      help: 'Total number of failed login attempts',
      labelNames: ['method', 'reason'],
    });
  }

  // HTTP Tracking Methods
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.labels(method, route, statusCode.toString()).inc();
    this.httpRequestDuration.labels(method, route, statusCode.toString()).observe(duration);
  }

  // Application Tracking Methods
  setActiveUsers(role: string, count: number) {
    this.activeUsersGauge.labels(role).set(count);
  }

  recordEnrollment(courseId: number, enrollmentType: 'purchase' | 'subscription') {
    this.enrollmentsTotal.labels(courseId.toString(), enrollmentType).inc();
  }

  setCourses(status: string, category: string, count: number) {
    this.coursesTotal.labels(status, category).set(count);
  }

  recordPayment(method: string, status: string, amount: number) {
    this.paymentsTotal.labels(method, status).inc();
    this.paymentAmount.labels(method).observe(amount);
  }

  // WebSocket Tracking Methods
  setWebSocketConnections(namespace: string, count: number) {
    this.wsConnectionsActive.labels(namespace).set(count);
  }

  recordWebSocketMessage(namespace: string, event: string) {
    this.wsMessagesTotal.labels(namespace, event).inc();
  }

  // Database Tracking Methods
  recordDbQuery(operation: string, table: string, duration: number) {
    this.dbQueryDuration.labels(operation, table).observe(duration);
  }

  setDbConnections(count: number) {
    this.dbConnectionsActive.set(count);
  }

  // File Upload Tracking Methods
  recordFileUpload(fileType: string, storageProvider: string, size: number) {
    this.fileUploadsTotal.labels(fileType, storageProvider).inc();
    this.fileUploadSize.labels(fileType).observe(size);
  }

  // Authentication Tracking Methods
  recordLoginAttempt(method: string) {
    this.loginAttempts.labels(method).inc();
  }

  recordLoginFailure(method: string, reason: string) {
    this.loginFailures.labels(method, reason).inc();
  }
}
