import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';
import { isDevelopment, getArrayEnv, EnvConfig } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const envConfig = configService.get<EnvConfig>('env');

  // Parse CORS origins from environment variable
  // Supports comma-separated values or single origin
  // IMPORTANT: Wildcard '*' is not allowed when credentials: true
  const corsOrigin = envConfig.CORS_ORIGIN || '';
  const frontendUrl = envConfig.FRONTEND_URL;
  
  let allowedOrigins: string[] | string;
  if (corsOrigin && corsOrigin.trim() !== '*') {
    // Parse comma-separated origins, filtering out wildcards
    allowedOrigins = corsOrigin
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin && origin !== '*');
    
    // If no valid origins after filtering, fall back to defaults
    if (allowedOrigins.length === 0) {
      allowedOrigins = [
        frontendUrl,
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3002',
      ];
    } else if (allowedOrigins.length === 1) {
      // If only one origin, use string format; otherwise use array
      allowedOrigins = allowedOrigins[0];
    }
  } else {
    // Default to frontend URL and common development origins
    // Note: Only include frontend origins, not the backend's own URL
    allowedOrigins = [
      frontendUrl,
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      // Add common Next.js dev server variations
      'http://localhost:3002',
      'http://127.0.0.1:3002',
    ];
  }
  
  // Log CORS configuration in development
  if (isDevelopment(envConfig)) {
    const originsList = Array.isArray(allowedOrigins) ? allowedOrigins : [allowedOrigins];
    console.log('🌐 CORS Configuration:', {
      allowedOrigins: originsList,
      credentials: true,
      note: 'Wildcard (*) is not allowed when credentials are enabled',
    });
    
    // Warn if any origin contains wildcard
    if (originsList.some(origin => origin === '*' || origin.includes('*'))) {
      console.warn('⚠️  WARNING: Wildcard origins are not compatible with credentials: true');
      console.warn('   Please use specific origins in CORS_ORIGIN environment variable');
    }
  }

  // Configure CORS with proper settings for credentials
  // IMPORTANT: origin must be specific (not '*') when credentials: true
  app.enableCors({
    origin: allowedOrigins, // Already filtered to exclude wildcards
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Cookie',
      'Set-Cookie',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: [
      'Content-Length',
      'Content-Type',
      'Set-Cookie',
    ],
    maxAge: 86400, // 24 hours
  });

  // Enable cookie parser for session management
  app.use(cookieParser());

  // Add minimal express-session middleware for passport-openidconnect
  // This is required by passport-openidconnect for OAuth state management
  // We use a memory store (fine for development; use Redis in production)
  const sessionStore = new session.MemoryStore();
  app.use(session.default({
    secret: configService.get<string>('JWT_SECRET') || 'default-secret-change-in-production',
    resave: true, // Set to true to ensure session is saved even if not modified (needed for OAuth state)
    saveUninitialized: true, // Set to true to save session even if not modified (needed for OAuth state)
    name: 'oidc.sid', // Use a different cookie name to avoid conflicts
    cookie: {
      secure: false, // Set to false for development (localhost), true for production with HTTPS
      httpOnly: true,
      sameSite: 'lax', // Allow cookie to be sent on cross-site redirects (needed for OAuth callback)
      maxAge: 10 * 60 * 1000, // 10 minutes (for OAuth state)
      path: '/', // Ensure cookie is available for all paths
    },
    store: sessionStore, // In production, use Redis or database store
  }));

  // Handle root and health endpoints before global prefix (for health checks)
  app.use((req, res, next) => {
    if (req.path === '/' && req.method === 'GET') {
      return res.json({ message: 'LEAP PM API is running' });
    }
    if (req.path === '/health' && req.method === 'GET') {
      return res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'LEAP PM API',
        version: '1.0.0',
      });
    }
    next();
  });

  // Handle static asset requests (favicons, robots.txt, etc.) silently
  // These requests are common from browsers and should not log errors
  app.use((req, res, next) => {
    const staticAssetPatterns = [
      /^\/favicon\.ico$/i,
      /^\/favicon-\d+x\d+\.png$/i,
      /^\/apple-touch-icon/i,
      /^\/robots\.txt$/i,
      /^\/sitemap\.xml$/i,
      /^\/manifest\.json$/i,
      /^\/.*\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/i,
    ];

    const isStaticAsset = staticAssetPatterns.some(pattern => pattern.test(req.path));
    
    if (isStaticAsset && req.method === 'GET') {
      // Return 404 silently without logging
      return res.status(404).end();
    }
    
    next();
  });

  // API Versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Exception Filters (order matters - more specific first)
  // HttpExceptionFilter handles all HTTP exceptions including validation errors
  // AllExceptionsFilter catches any unhandled exceptions as a safety net
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new AllExceptionsFilter(),
  );

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false, // Collect all validation errors
      enableDebugMessages: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('LEAP PM API')
    .setDescription('Comprehensive Learning Management System API with Social Features')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management')
    .addTag('Lookups', 'System lookup values')
    .addTag('Courses', 'Course management')
    .addTag('Enrollments', 'Course enrollments')
    .addTag('Subscriptions', 'Subscription plans and management')
    .addTag('Payments', 'Payment processing')
    .addTag('Social', 'Social features (posts, groups, pages)')
    .addTag('Events', 'Event management')
    .addTag('Jobs', 'Job postings and applications')
    .addTag('Chat', 'Real-time messaging')
    .addTag('Notifications', 'User notifications')
    .addTag('Media', 'File uploads and management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // gRPC Microservice Configuration
  const grpcHost = envConfig.GRPC_HOST;
  const grpcPort = parseInt(envConfig.GRPC_PORT, 10);
  const enableGrpc = configService.get<string>('ENABLE_GRPC') !== 'false'; // Default to true

  if (enableGrpc) {
    try {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
          package: [
            'users',
            'courses',
            'lookups',
            'subscriptions',
            'media',
            'audit',
            'polymorphic',
            'social',
            'lms.assessments',
            'lms.student',
          ],
          protoPath: [
            join(__dirname, 'grpc/proto/users.proto'),
            join(__dirname, 'grpc/proto/courses.proto'),
            join(__dirname, 'grpc/proto/lookups.proto'),
            join(__dirname, 'grpc/proto/subscriptions.proto'),
            join(__dirname, 'grpc/proto/media.proto'),
            join(__dirname, 'grpc/proto/audit.proto'),
            join(__dirname, 'grpc/proto/polymorphic.proto'),
            join(__dirname, 'grpc/proto/social.proto'),
            join(__dirname, 'grpc/proto/lms-assessments.proto'),
            join(__dirname, 'grpc/proto/lms-student.proto'),
          ],
          url: `${grpcHost}:${grpcPort}`,
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
          },
        },
      });

      // Start all microservices (gRPC)
      await app.startAllMicroservices();
      console.log(`🔌 gRPC Server running on: ${grpcHost}:${grpcPort}`);
    } catch (error) {
      if (error.message?.includes('EADDRINUSE') || error.message?.includes('address already in use')) {
        console.warn(`⚠️  gRPC port ${grpcPort} is already in use. gRPC server will not be started.`);
        console.warn(`   To disable gRPC, set ENABLE_GRPC=false in your environment variables.`);
        console.warn(`   To use a different port, set GRPC_PORT=<port> in your environment variables.`);
      } else {
        console.error(`❌ Failed to start gRPC server:`, error.message);
        console.error(`   gRPC functionality will not be available.`);
      }
    }
  } else {
    console.log('ℹ️  gRPC is disabled (ENABLE_GRPC=false)');
  }

  const port = parseInt(envConfig.PORT, 10);
  const host = envConfig.HOST;
  const appUrl = `http://${host}:${port}`;
  await app.listen(port, host, () => {
    console.log(`🚀 Application is running on: ${appUrl}`);
    console.log(`📚 Swagger API Documentation: ${appUrl}/api/docs`);
    console.log(`🔥 GraphQL Playground: ${appUrl}/graphql`);
  });

}

bootstrap();
